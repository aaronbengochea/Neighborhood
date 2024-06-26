const pool = require('./dbconfig')

const updateProfile = async (req, res) => {
  const { uid, addrs1, addrs2, city, state, zip, location, f_desc, f_photo } = req.body

  try {
    const updateUserQuery = `
      UPDATE users
      SET addrs1 = $1, addrs2 = $2, city = $3, state = $4, zip = $5, location = $6
      WHERE uid = $7
    `;
    await pool.query(updateUserQuery, [addrs1, addrs2, city, state, zip, location, uid])

    const profileCheckQuery = `
      SELECT * 
      FROM user_profiles 
      WHERE uid = $1;
    `;
    const profileCheckResult = await pool.query(profileCheckQuery, [uid])

    if (profileCheckResult.rows.length > 0) {
      // Update user_profiles table
      const updateProfileQuery = `
        UPDATE user_profiles
        SET f_desc = $1, f_photo = $2
        WHERE uid = $3;
      `;
      await pool.query(updateProfileQuery, [f_desc, f_photo, uid])
    } else {
      // Insert into user_profiles table
      const insertProfileQuery = `
        INSERT INTO user_profiles (uid, f_desc, f_photo)
        VALUES ($1, $2, $3);
      `;
      await pool.query(insertProfileQuery, [uid, f_desc, f_photo])
    }

    res.status(200).send('Profile updated successfully')
  } catch (error) {
    console.error('Failed to update profile:', error)
    res.status(500).send('Failed to update profile')
  }
}


const userSignin = async (req, res) => {
  const { email, password } = req.body

  try {
    const checkUserPassword = `
      SELECT uid 
      FROM users 
      WHERE 
        email = $1 
        AND pass = $2
      `;
    const result = await pool.query(checkUserPassword, [email, password])

    if (result.rows.length > 0) {
      const uid = result.rows[0].uid
      const addUserLog = `
        INSERT INTO user_logs (uid, last_login)
        values ($1, now())
      `
      await pool.query(addUserLog,[uid])

      res.status(200).json({ uid: result.rows[0].uid })
    } else {
      res.status(200).json({ message: 'Error: Invalid credentials' })
    }
  } catch (error) {
    console.error('Database query error', error.stack);
    res.status(500).json({ error: 'Internal server error' })
  }
}


const userSignup = async (req, res) => {
  const { fname, lname, email, addrs1, addrs2, city, state, zip, username, pass ,location} = req.body
  
  try {
    
    const userSignupQuery = `
      INSERT INTO users (fname, lname, email, addrs1, addrs2, city, state, zip, username, pass, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING uid;
    `;
    const result = await pool.query(userSignupQuery, [fname, lname, email, addrs1, addrs2, city, state, zip, username, pass ,location]);
    const uid = result.rows[0].uid
    res.status(201).send({uid: uid, message: 'User successfully created' })

  } catch (error) {
    if (error.message === 'Username already in use') {
      return res.status(409).send({ error: error.message })
    }
    if (error.message === 'Email already in use') {
      return res.status(409).send({ error: error.message })
    }
      console.error('Signup failed:', error);
      res.status(500).send({ error: 'Internal server error' })
  }
}


const joinBlock = async (req, res) => {
  const { uid, bid } = req.body

  if (!uid || !bid === null) {
    return res.status(400).send({ error: 'Missing required fields' })
  }
  try {
    const result = await joinBlockHelper(uid, bid)
    res.status(200).send(result)
  } catch (error) {
    console.error('Failed to add user to block membership voting table:', error)
    res.status(500).send({ error: 'Internal server error' })
  }
}


const blockFeedThreadsRecieved = async (req, res) => {
  const { uid } = req.params;

  try {
    const findBlock = `
      SELECT bid 
      FROM memberships 
      WHERE uid = $1`; 
    const userResult = await pool.query(findBlock, [uid])

    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'Block Feed Received Threads: User is currently not a member of a block' })
    }

    const blockId = userResult.rows[0].bid
    const blockIdString = blockId.toString()

    // Now fetch the threads for that block
    const threadQuery = `
      SELECT t.tid, t.subject, t.body, t.created, u.username
      FROM threads t
      JOIN users u ON t.uid = u.uid
      WHERE 
          t.uid != $1
          AND receiverType = 'block'
          AND receiver = $2
      ORDER BY created DESC;
    `;
    const threadResult = await pool.query(threadQuery, [uid, blockIdString])

    if (threadResult.rows.length > 0) {
      res.status(200).json({ threads: threadResult.rows })
    } else {
      res.status(200).json({ message: 'Block Feed Received Threads: User has not received any threads associated with their corresponding block' })
    }
  } catch (error) {
    console.error('Database query error:', error.stack)
    res.status(500).json({ error: 'Internal server error' })
  }
}


  const blockFeedThreadsCreated = async (req, res) => {
    const { uid } = req.params;
  
    try {
      const findBlock = `
        SELECT bid 
        FROM memberships 
        WHERE uid = $1`; 
      const userResult = await pool.query(findBlock, [uid]);
  
      if (userResult.rows.length === 0) {
        return res.status(200).json({ message: 'Block Feed Created Threads: User is currently not a member of a block' })
      }
  
      const blockId = userResult.rows[0].bid;
      const blockIdString = blockId.toString()
  
      // Now fetch the threads for that block
      const threadQuery = `
        SELECT t.tid, t.subject, t.body, t.created, u.username
        FROM threads t
        JOIN users u ON t.uid = u.uid
        WHERE 
            t.uid = $1
            AND receiverType = 'block'
            AND receiver = $2
        ORDER BY created DESC;
      `;
      const threadResult = await pool.query(threadQuery, [uid ,blockIdString]);
  
      if (threadResult.rows.length > 0) {
        res.status(200).json({ threads: threadResult.rows });
      } else {
        res.status(200).json({ message: 'Block Feed Created Threads: User has not created any threads associated with their corresponding block' })
      }
    } catch (error) {
      console.error('Database query error:', error.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  const neighborhoodFeedThreadsRecieved = async (req, res) => {
    const { uid } = req.params;

  try {
    const findNeighborhood = `
        SELECT b.nid 
        FROM memberships m
        JOIN blocks b ON m.bid = b.bid
        WHERE uid = $1`;
    const userResult = await pool.query(findNeighborhood, [uid]);

    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'Neighborhood Feed Received Threads: User is currently not a member of a neighborhood or block' })
    }

    const neighborhoodId = userResult.rows[0].nid;

    const threadQuery = `
      SELECT t.tid, t.subject, t.body, t.created, u.username
      FROM threads t
      JOIN users u ON t.uid = u.uid
      WHERE 
          t.uid != $1
          AND receiverType = 'neighborhood'
          AND receiver = $2
      ORDER BY created DESC;
    `;
    const threadResult = await pool.query(threadQuery, [uid, neighborhoodId]);

    if (threadResult.rows.length > 0) {
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Neighborhood Feed Received Threads: User has not received any threads associated with their corresponding neighborhood'})
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const neighborhoodFeedThreadsCreated = async (req, res) => {
    const { uid } = req.params;

    try {
        const findNeighborhood = `
            SELECT b.nid 
            FROM memberships m
            JOIN blocks b ON m.bid = b.bid
            WHERE uid = $1`;

        const userResult = await pool.query(findNeighborhood, [uid]);

        if (userResult.rows.length === 0) {
        return res.status(200).json({ message: 'Neighborhood Feed Created Threads: User is currently not a member of a neighborhood or block' })
        }

        const neighborhoodId = userResult.rows[0].nid;

        const threadQuery = `
            SELECT t.tid, t.subject, t.body, t.created, u.username
            FROM threads t
            JOIN users u ON t.uid = u.uid
            WHERE 
                t.uid = $1
                AND receiverType = 'neighborhood'
                AND receiver = $2
            ORDER BY created DESC;
        `;
        const threadResult = await pool.query(threadQuery, [uid, neighborhoodId]);

        if (threadResult.rows.length > 0) {
        res.status(200).json({ threads: threadResult.rows });
        } else {
        res.status(200).json({ message: 'Neighborhood Feed Created Threads: User has not created any threads associated with their corresponding neighborhood'})
        }
    } catch (error) {
        console.error('Database query error:', error.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const friendsFeedThreadsRecieved = async (req, res) => {
    const { uid } = req.params;

  try {

    const threadQuery = `
        WITH t1 AS (
          SELECT 
          CASE 
            WHEN f1 = $1 THEN f2  
            ELSE f1              
          END AS friend_id
          FROM friends
          WHERE 
          (f1 = $1 OR f2 = $1)    
          AND accepted = true 
        )
                
        SELECT t.tid, t.subject, t.body, t.created, u.username
        FROM threads t, t1, users u
        WHERE 
          t.uid = t1.friend_id
          AND t1.friend_id = u.uid
          AND receivertype = 'friend'
        ORDER BY created DESC;
    `;
    const threadResult = await pool.query(threadQuery, [uid]);

    if (threadResult.rows.length > 0) {
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Friends Feed Received Threads: User has not received any threads from friends' });
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const friendsFeedThreadsCreated = async (req, res) => {
    const { uid } = req.params;

  try {

    const threadQuery = `
        SELECT t.tid, t.subject, t.body, t.created, u.username 
        FROM threads t, users u
        WHERE 
            t.uid = $1
            AND cast(t.receiver as int) = u.uid
            AND receivertype = 'friend'
        order by t.created desc
    `;
    const threadResult = await pool.query(threadQuery, [uid]);

    if (threadResult.rows.length > 0) {
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Friends Feed Created Threads: User has not created any threads for friends' });
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const neighborsFeedThreadsReceived = async (req, res) => {
  const { uid } = req.params;

try {

  const threadQuery = `
      SELECT t.tid, t.subject, t.body, t.created, u.username
      FROM threads t, users u
      WHERE 
        t.receivertype = 'neighbor'
        AND t.receiver = $1
        AND t.uid = u.uid
      ORDER BY created DESC
  `;
  const threadResult = await pool.query(threadQuery, [uid]);

  if (threadResult.rows.length > 0) {
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({message: 'Neighbors Feed Received Threads: User has not received any threads from neighbors'});
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}


const neighborsFeedThreadsCreated = async (req, res) => {
  const { uid } = req.params;

try {

  const threadQuery = `
      SELECT t.tid, t.subject, t.body, t.created, u.username
      FROM threads t, users u
      WHERE 
        t.receivertype = 'neighbor'
        AND t.uid = $1
        AND cast(t.receiver as int) = u.uid
      ORDER BY created DESC
  `;
  const threadResult = await pool.query(threadQuery, [uid]);

  if (threadResult.rows.length > 0) {
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({message: 'Neighbors Feed Created Threads: User has not created any threads for neighbors'});
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}


//Have to remove b_name because some friends wont be members of blocks
const friendsListFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const friendsListFetchQuery = `
    WITH t1 AS (
      SELECT 
      CASE 
        WHEN f1 = $1 THEN f2  
        ELSE f1              
      END AS friend_id
      FROM friends
      WHERE 
      (f1 = $1 OR f2 = $1)    
      AND accepted = true 
    )

  select u.username, b.b_name 
  from t1
  join users u on t1.friend_id = u.uid
  left join memberships m on u.uid = m.uid
  left join blocks b on m.bid = b.bid
  `;
  const threadResult = await pool.query(friendsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({message: 'Friends List: Friends list is empty'});
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}


const neighborsListFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const neighborsListFetchQuery = `
      select u.username, b.b_name
      from neighbors n, users u, memberships m, blocks b
      where 
        n.n1 = $1
        and n.n2 = u.uid
        and n.n2 = m.uid
        and m.bid = b.bid
      order by username asc
  `;
  const threadResult = await pool.query(neighborsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({ message: 'Neighbor List: Neighbors list is empty' });
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}



const friendRequestsReceivedPendingFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const neighborsListFetchQuery = `
      select u.uid, u.username, b.b_name, f.request_time 
      from friends f, users u, memberships m, blocks b
      where 
        f.f1 != $1
        and f.f2 = $1
        and f.accepted = false
        and f.f1 = u.uid
        and f.f1 = m.uid
        and m.bid = b.bid
  `;
  const threadResult = await pool.query(neighborsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({message: 'Recieved Friend Requests: User has no pending friend requests'});
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}



const friendRequestsSentPendingFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const friendsListFetchQuery = `
      select u.username, f.request_time
      from friends f, users u
      where 
        f.f1 = $1
        and f.f2 != $1
        and f.accepted = false
        and f.f2 = u.uid
  `;
  const threadResult = await pool.query(friendsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({ message: 'Friend Request Sent: User has no pending friend request to be accepted' });
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}


const prospectiveMembersFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const neighborsListFetchQuery = `
    with t1 as (
      select joiner 
      from join_block_votes j
      where voter = $1
      ),
      
      t2 as (
      select bid 
      from memberships
      where uid = $1
      )
      
      select j.uid, j.bid, u.username, b.b_name, n.n_name
      from join_blocks j, users u, blocks b, neighborhoods n
      where 
        j.bid in (select * from t2)
        and j.uid not in (select * from t1)
        and u.uid = j.uid
        and j.bid = b.bid
        and b.nid = n.nid
  `;
  const threadResult = await pool.query(neighborsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else if (threadResult.rows.length === 0) {
    res.status(200).json({message: 'Membership Voting: Either no one to vote for or user is not a member of a block yet'});
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}

const findNeighborsFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const neighborsListFetchQuery = `
      with t1 as (
        select bid 
        from memberships 
        where uid = $1
      )
      
      select m.uid, u.username, b.b_name 
      from memberships m, users u, blocks b, t1
      where 
        m.bid = t1.bid
        and m.uid != $1
        and m.uid = u.uid
        and m.bid = b.bid
        and m.uid not in (
          select n2 
          from neighbors 
          where n1 = $1
        )
  `;
  const threadResult = await pool.query(neighborsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({message: 'Add To Neighbors List: User must be part of a block in order to find neighbors. User is either not part of a block or has already added all potential neighbors'});
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}

const addNeighborsToList = async (req, res) => {
  const { uid, neighborUid } = req.body;

  try {
    const insertQuery = `
      INSERT INTO neighbors (n1, n2)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [uid, neighborUid]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating thread:', error.stack);
    res.status(500).send('Failed to create thread');
  }
}


const acceptFriendRequest = async (req, res) => {
  const { uid, senderUid } = req.body;

  try {
    const insertQuery = `
      update friends
      set accepted = true
      where f1 = $2
        and f2 = $1
    `;
    const result = await pool.query(insertQuery, [uid, senderUid]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating thread:', error.stack);
    res.status(500).send('Failed to create thread');
  }
}


const getUserProfile = async (req, res) => {
  const { uid } = req.params

try {

  const friendsListFetchQuery = `
      select u.addrs1, u.addrs2, u.city, u.state, u.zip, p.f_desc, p.f_photo
      from users u
      full join user_profiles p on u.uid = p.uid
      where u.uid = $1
  `;
  const threadResult = await pool.query(friendsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(404).send('Could not fetch user profile');
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}



const createThread = async (req, res) => {
    const { uid, subject, body, receiverType, receiver } = req.body;

    try {

      const findUserLocationQuery=`
      select location 
      from users 
      where uid = $1
      `;
      const location = await pool.query(findUserLocationQuery, [uid]);
      const locationData = location.rows[0].location
      const finalLocationData = `(${locationData.x},${locationData.y})`
      
      const createThreadQuery = `
        INSERT INTO threads (uid, subject, body, receiver, created, position, receivertype)
        VALUES ($1, $2, $3, $4, now(), $5, $6)
        RETURNING *;
      `;
      const result = await pool.query(createThreadQuery, [uid, subject, body, receiver, finalLocationData, receiverType]);
      console.log(result)
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating thread:', error.stack);
      res.status(500).send('Failed to create thread');
    }
  }

  const submitMembershipVote = async (req, res) => {
    const { voter, joiner, block } = req.body;
    try {
        // Insert vote into the database
        const insertVoteQuery = `
            INSERT INTO join_block_votes (voter, joiner, block) 
            VALUES ($1, $2, $3);
        `;
        await pool.query(insertVoteQuery, [voter, joiner, block]);

        // Check total votes for the joiner in the specific block
        const votesQuery = `
            SELECT COUNT(joiner) AS vote_count
            FROM join_block_votes
            WHERE joiner = $1 AND block = $2;
        `;
        const votesResult = await pool.query(votesQuery, [joiner, block]);
        const totalVotes = votesResult.rows[0].vote_count;

        // Check total members in the block
        const membersQuery = `
            SELECT COUNT(uid) AS member_count
            FROM memberships
            WHERE bid = $1;
        `;
        const membersResult = await pool.query(membersQuery, [block]);
        const totalMembers = membersResult.rows[0].member_count;

        // Determine if membership conditions are met
        let votesNeeded = totalMembers < 3 ? totalMembers : 3;
        if (totalVotes >= votesNeeded) {
            // Transaction to remove from join_block_votes and add to memberships
            await pool.query('BEGIN');
            const deleteJoinBlockQuery = `
                DELETE FROM join_blocks 
                WHERE uid = $1;
            `;
            await pool.query(deleteJoinBlockQuery, [joiner]);

            const insertMembershipQuery = `
                INSERT INTO memberships (uid, bid, joined)
                VALUES ($1, $2, now());
            `;
            await pool.query(insertMembershipQuery, [joiner, block]);
            await pool.query('COMMIT');

            res.status(200).json({ message: 'Membership updated successfully' });
        } else {
            res.status(200).json({ message: 'Vote recorded, but not enough votes for membership yet' });
        }
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error processing vote:', error);
        res.status(500).json({ message: 'Failed to process vote', error: error });
    }
}



const findFriendsFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const neighborsListFetchQuery = `
      with t1 as (
        SELECT 
        CASE 
        WHEN f1 = $1 THEN f2  
        ELSE f1              
        END AS friend_id
        FROM friends
        WHERE 
        (f1 = $1 OR f2 = $1)
        order by friend_id 
        )
        
        select uid, username 
        from users 
        where uid not in (select friend_id from t1)
          and uid != $1
        order by username
  `;
  const threadResult = await pool.query(neighborsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(200).json({ message: 'Find Friends: User has already added or sent friend request to all available users' });
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}

const sendFriendRequest = async (req, res) => {
  const { uid, friendUid } = req.body;

  try {
    const insertQuery = `
      INSERT INTO friends (f1, f2, accepted, request_time)
      VALUES ($1, $2, false, now())
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [uid, friendUid]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating thread:', error.stack);
    res.status(500).send('Failed to create thread');
  }
}

  const findBlocksToFollowFetch = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const neighborsListFetchQuery = `
      with t1 as (
        select bid 
        from memberships
        where uid = $1
        ),
        
        t2 as (
        select bid
        from follow_blocks
        where uid = $1
        )
        
        select b.bid, b.b_name, n.n_name 
        from blocks b
        join neighborhoods n on n.nid = b.nid
        where 
          bid not in (select * from t1)
          and bid not in (select * from t2)
        order by bid
    `;
    const threadResult = await pool.query(neighborsListFetchQuery, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Follow Blocks: User has already followed all available blocks' });
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }

  const followBlock = async (req, res) => {
    const { uid, bid } = req.body;
  
    try {
      const insertQuery = `
        INSERT INTO follow_blocks (uid, bid)
        VALUES ($1, $2)
      `;
      const result = await pool.query(insertQuery, [uid, bid]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating thread:', error.stack);
      res.status(500).send('Failed to create thread');
    }
  }


  const findFollowedBlocksFetch = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const neighborsListFetchQuery = `
        select f.bid, b.b_name, n.n_name
        from follow_blocks f, blocks b, neighborhoods n
        where 
          uid = $1
          and f.bid = b.bid
          and b.nid = n.nid
    `;
    const threadResult = await pool.query(neighborsListFetchQuery, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Followed Blocks: User is currently not following any blocks' });
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }

  const friendsListThreadFetch = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const friendsListFetchQuery = `
        WITH t1 AS (
          SELECT 
          CASE 
            WHEN f1 = $1 THEN f2  
            ELSE f1              
          END AS friend_id
          FROM friends
          WHERE 
          (f1 = $1 OR f2 = $1)    
          AND accepted = true 
        )
        
        SELECT u.uid, u.username
        FROM t1, users u
        WHERE 
          u.uid = t1.friend_id
        order by username
         
    `;
    const threadResult = await pool.query(friendsListFetchQuery, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({message: 'User currently has no friends'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }

  const neighborsListThreadFetch = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const friendsListFetchQuery = `
        select u.uid, u.username 
        from neighbors n, users u
        where 
          n.n1 = $1
          and n.n2 = u.uid
         
    `;
    const threadResult = await pool.query(friendsListFetchQuery, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({message: 'User currently has no neighbors'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }

  const blockFetch = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const friendsListFetchQuery = `
        select m.bid, b.b_name 
        from memberships m, blocks b
        where 
          m.uid = $1
          and m.bid = b.bid
         
    `;
    const threadResult = await pool.query(friendsListFetchQuery, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({message: 'User is currently not a member of a block'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }


  const neighborhoodFetch = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const neighborhoodQuery = `
        select n.nid, n.n_name
        from memberships m, blocks b, neighborhoods n
        where 
          m.uid = $1
          and m.bid = b.bid
          and b.nid = n.nid
         
    `;
    const threadResult = await pool.query(neighborhoodQuery, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({message: 'User is currently not a member of a neighborhood'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }

  
  const followedBlocksFeedThreadsRecieved = async (req, res) => {
    const { uid } = req.params;
  
    try {
      const findFollowedBlocks = `
        SELECT bid 
        FROM follow_blocks
        WHERE uid = $1`; 
      const followedBlocksResults = await pool.query(findFollowedBlocks, [uid])
  
      if (followedBlocksResults.rows.length === 0) {
        return res.status(200).json({message:'Followed Blocks Feed: User has not followed any blocks'})
      }
  
      const blockIds = followedBlocksResults.rows.map(row => row.bid);
      const blockIdStrings = blockIds.map(id => `'${id}'`).join(', ');
  
      // Now fetch the threads for that block
      const threadQuery = `
        SELECT t.tid, t.subject, t.body, t.created, u.username, b.b_name, n.n_name
        FROM threads t
        JOIN users u ON t.uid = u.uid
        JOIN memberships m ON t.uid = m.uid
		    JOIN blocks b ON m.bid = b.bid
		    JOIN neighborhoods n ON b.nid = n.nid
        WHERE 
            t.uid != $1
            AND receiverType = 'block'
            AND receiver IN (${blockIdStrings})
        ORDER BY created DESC;
      `;

      const threadResult = await pool.query(threadQuery, [uid])
  
      if (threadResult.rows.length > 0) {
        res.status(200).json({ threads: threadResult.rows })
      } else {
        res.status(200).json({message:'Followed Blocks Feed: No threads have been posted to any of the blocks the user follows'})
      }
    } catch (error) {
      console.error('Database query error:', error.stack)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  const findEligibleBlockForMembership = async (req, res) => {
    const { uid } = req.params;
  
    try {
      const findClosestEligibleBlock = `
      with t1 as (
        select uid, location from users
        where uid = $1
        order by uid desc
        ),
        
        t2 as (
        select uid 
        from join_blocks
        where uid = $1
        ),
        
        t3 as (
        select uid 
        from memberships
        where uid = $1
        )
        
        select t1.uid, b.bid, b.b_name, n.n_name, t1.location <-> b.location as distance
        from blocks b, t1, neighborhoods n
        where 
          b.nid = n.nid 
          and t1.uid not in (select uid from t2)
          and t1.uid not in (select uid from t3)
        order by distance
        limit 1`;
      
      const threadResult = await pool.query(findClosestEligibleBlock, [uid])
  
      if (threadResult.rows.length > 0) {
        res.status(200).json({ threads: threadResult.rows })
      } else {
        res.status(200).json({ message: 'Apply Block Membership: User has already applied and is pending approval or is already a member of a block' })
      }
    } catch (error) {
      console.error('Database query error:', error.stack)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  const applyForBlockMembership = async (req, res) => {
    const { uid, bid } = req.body;
  
    try {
      const insertQuery = `
        INSERT INTO join_blocks (uid, bid)
        VALUES ($1, $2)
      `;
      const result = await pool.query(insertQuery, [uid, bid]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating thread:', error.stack);
      res.status(500).send('Failed to create thread');
    }
  }

  
  const findJoinedBlocksPendingFetch = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const joinedBlocksPending = `
      select j.bid, b.b_name, n.n_name
      from join_blocks j
      join blocks b on j.bid = b.bid
      join neighborhoods n on b.nid = n.nid
      where uid = $1
    `;
    const threadResult = await pool.query(joinedBlocksPending, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Block Membership Application Pending: User does not have a pending block membership application currently'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }

  const singleThreadFetch = async (req, res) => {
    const { tid } = req.params;
  
  try {
  
    const threadFetch = `
      select t.*, u.username
      from threads t, users u
      where 
        tid = $1
        and t.uid = u.uid
    `;
    const threadResult = await pool.query(threadFetch, [tid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Error fetching thread details'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }


  const singleThreadMessagesFetch = async (req, res) => {
    const { tid } = req.params;
  
  try {
  
    const threadMessagesFetch = `
      select m.*, u.username
      from messages m, users u
      where 
        tid = $1
        and m.uid = u.uid
      order by created desc
    `;
    const threadResult = await pool.query(threadMessagesFetch, [tid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Thread currently has no messages'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }


  
  const postMessage = async (req, res) => {
    const { tid } = req.params;
    const { uid, body } = req.body;
  
    try {
      const insertQuery = `
        INSERT INTO messages (tid, uid, body, created)
        VALUES ($1, $2, $3, now())
      `;
      const result = await pool.query(insertQuery, [tid, uid, body]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating thread:', error.stack);
      res.status(500).send('Failed to create thread');
    }
  }

  const membershipStatus = async (req, res) => {
    const { uid } = req.params;
  
  try {
  
    const membershipFetch = `
      SELECT b.bid, b.b_name, n.n_name
      FROM memberships m
      JOIN blocks b ON m.bid = b.bid
      JOIN neighborhoods n ON b.nid = n.nid
      WHERE m.uid = $1;
    `;
    const threadResult = await pool.query(membershipFetch, [uid]);
  
    if (threadResult.rows.length > 0) {
      console.log(threadResult.rows)
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Membership Status: User is currently not a member of any block'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }

  const usersFetch = async (req, res) => {
  
  try {
    const membershipFetch = `
      SELECT * from users
    `;
    const threadResult = await pool.query(membershipFetch);
  
    if (threadResult.rows.length > 0) {
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(200).json({ message: 'Table does not exist'});
    }
  } catch (error) {
    console.error('Database query error:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
  }




const joinBlockHelper = async (uid, bid) => {
    // First, check if there's already an entry for this uid
    const checkQuery = `
      SELECT 1 
      FROM join_blocks 
      WHERE uid = $1;
    `;

    try {
        const checkResult = await pool.query(checkQuery, [uid])
        if (checkResult.rows.length > 0) {
          return{ message: 'User has already applied for a block' } 
        }

        const insertQuery = `
            INSERT INTO join_blocks (uid, bid)
            VALUES ($1, $2);
        `;

        await pool.query(insertQuery, [uid, bid]);
        return { message: 'Membership application successful' }
    } catch (error) {
        console.error('Error in becoming a member:', error)
        throw error
    }
};


module.exports = {
    updateProfile,
    userSignin,
    userSignup,
    joinBlock,
    blockFeedThreadsRecieved,
    blockFeedThreadsCreated,
    neighborhoodFeedThreadsRecieved,
    neighborhoodFeedThreadsCreated,
    friendsFeedThreadsRecieved,
    friendsFeedThreadsCreated,
    neighborsFeedThreadsReceived,
    neighborsFeedThreadsCreated,
    createThread,
    friendsListFetch,
    neighborsListFetch,
    friendRequestsReceivedPendingFetch,
    friendRequestsSentPendingFetch,
    prospectiveMembersFetch,
    findNeighborsFetch,
    addNeighborsToList,
    acceptFriendRequest,
    getUserProfile,
    submitMembershipVote,
    findFriendsFetch,
    sendFriendRequest,
    findBlocksToFollowFetch,
    followBlock,
    findFollowedBlocksFetch,
    friendsListThreadFetch,
    neighborsListThreadFetch,
    blockFetch,
    neighborhoodFetch,
    followedBlocksFeedThreadsRecieved,
    findEligibleBlockForMembership,
    applyForBlockMembership,
    findJoinedBlocksPendingFetch,
    singleThreadFetch,
    singleThreadMessagesFetch,
    postMessage,
    membershipStatus,
    usersFetch,

    
}