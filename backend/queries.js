const pool = require('./dbconfig')

const updateProfile = async (req, res) => {
    const { uid, f_desc, f_photo } = req.body

    if (!uid) {
        return res.status(400).send('User ID is required')
    }

    try {
        const rowsAffected = await updateProfilesHelper(uid, f_desc, f_photo)
        res.status(200).send(`Profile updated. Rows affected: ${rowsAffected}`)
    } catch (error) {
        console.error('Failed to update profile:', error)
        res.status(500).send('Failed to update profile')
    }
};

const userSignin = async (req, res) => {
    console.log('someone came to signin')
    const { email, password } = req.body;

  try {
    const query = 'SELECT uid FROM users WHERE email = $1 AND pass = $2';
    const values = [email, password];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      // User found, return the UID
      res.status(200).json({ uid: result.rows[0].uid });
    } else {
      // User not found or wrong password
      res.status(404).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Database query error', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const userSignup = async (req, res) => {
    console.log('someone came to signup')
    try {
        const uid = await userSignupHelper(req.body)
        res.status(201).send({ uid: uid, message: 'User successfully created' })
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
};

const joinBlock = async (req, res) => {
    const { uid, bid } = req.body

    if (!uid || !bid === null) {
        return res.status(400).send({ error: 'Missing required fields' })
    }

    try {
        const result = await joinBlockHelper(uid, bid);
        res.status(200).send(result)
    } catch (error) {
        console.error('Failed to process membership:', error);
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
      const userResult = await pool.query(findBlock, [uid]);
  
      if (userResult.rows.length === 0) {
        return res.status(404).send('User not found or not associated with any block');
      }
  
      const blockId = userResult.rows[0].bid;
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
      const threadResult = await pool.query(threadQuery, [uid, blockIdString]);
  
      if (threadResult.rows.length > 0) {
        res.status(200).json({ threads: threadResult.rows });
      } else {
        res.status(404).send('No received threads found for this block');
      }
    } catch (error) {
      console.error('Database query error:', error.stack);
      res.status(500).json({ error: 'Internal server error' });
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
        return res.status(404).send('User not found or not associated with any block');
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
        res.status(404).send('No created threads found for this block');
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
      return res.status(404).send('User not found or not associated with any neighborhood');
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
      res.status(404).send('No received threads found for this neighborhood');
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
        return res.status(404).send('User not found or not associated with any neighborhood');
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
        res.status(404).send('No created threads found for this neighborhood');
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
      res.status(404).send('No received friend threads found for this user');
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
    `;
    const threadResult = await pool.query(threadQuery, [uid]);

    if (threadResult.rows.length > 0) {
      res.status(200).json({ threads: threadResult.rows });
    } else {
      res.status(404).send('No created friend threads found for this user');
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
    res.status(404).send('No received neighbors threads found for this user');
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
    res.status(404).send('No created neighbors threads found for this user');
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}



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
      
      SELECT u.username, b.b_name
      FROM t1, users u, memberships m, blocks b
      WHERE 
        u.uid = t1.friend_id
        AND u.uid = m.uid
        AND m.bid = b.bid
      ORDER BY username asc
  `;
  const threadResult = await pool.query(friendsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(404).send('No created neighbors threads found for this user');
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
    res.status(404).send('No created neighbors threads found for this user');
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
      select u.username, b.b_name, f.request_time 
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
    res.status(404).send('No created neighbors threads found for this user');
  }
} catch (error) {
  console.error('Database query error:', error.stack);
  res.status(500).json({ error: 'Internal server error' });
}
}



const friendRequestsSentPendingFetch = async (req, res) => {
  const { uid } = req.params;

try {

  const neighborsListFetchQuery = `
      select u.username, b.b_name, f.request_time
      from friends f, users u, memberships m, blocks b
      where 
        f.f1 = $1
        and f.f2 != $1
        and f.accepted = false
        and f.f2 = u.uid
        and f.f2 = m.uid
        and m.bid = b.bid
  `;
  const threadResult = await pool.query(neighborsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(404).send('No created neighbors threads found for this user');
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
        select bid
        from memberships
        where uid = $1
      ),
      
      t2 as (
        select j.uid, j.bid 
        from join_blocks j, join_block_votes v, t1
        where 
          j.bid = t1.bid
          and v.voter = $1
          and v.joiner = j.uid
      )
      
      select j.uid, j.bid, u.username, b.b_name
      from join_blocks j, t2, users u, blocks b
      where 
        j.bid = t2.bid
        and t2.uid != j.uid
        and j.uid = u.uid
        and j.bid = b.bid
  `;
  const threadResult = await pool.query(neighborsListFetchQuery, [uid]);

  if (threadResult.rows.length > 0) {
    console.log(threadResult.rows)
    res.status(200).json({ threads: threadResult.rows });
  } else {
    res.status(404).send('No created neighbors threads found for this user');
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
    res.status(404).send('No created neighbors threads found for this user');
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
















const createThread = async (req, res) => {
    const { uid, subject, body, receiverType } = req.body;
    let receiverId;

    try {
      if (receiverType === 'neighborhood') {
        const findNidQuery = `
            SELECT b.nid 
            FROM memberships m
            JOIN blocks b ON m.bid = b.bid
            WHERE uid = $1`;
        const nidResult = await pool.query(findNidQuery, [uid]);
        if (nidResult.rows.length === 0) {
          return res.status(404).send('User not found or not associated with any neighborhood');
        }
        receiverId = nidResult.rows[0].nid;
      } else if (receiverType === 'block') {
        // Fetch the block id for this user
        const findBidQuery = `
            SELECT bid 
            FROM memberships 
            WHERE uid = $1`;
        const bidResult = await pool.query(findBidQuery, [uid]);
        if (bidResult.rows.length === 0) {
          return res.status(404).send('User not found or not associated with any block');
        }
        receiverId = bidResult.rows[0].bid;
      } else {
        // Use the receiver id provided in the request for other types
        receiverId = req.body.receiver;
      }

      const insertQuery = `
        INSERT INTO threads (uid, subject, body, receiver, created, receivertype)
        VALUES ($1, $2, $3, $4, now(), $5)
        RETURNING *;
      `;
      const result = await pool.query(insertQuery, [uid, subject, body, receiverId, receiverType]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating thread:', error.stack);
      res.status(500).send('Failed to create thread');
    }
  }

  




















const joinBlockHelper = async (uid, bid) => {
    // First, check if there's already an entry for this uid
    const checkQuery = `
        SELECT 1 FROM join_blocks WHERE uid = $1;
    `;

    try {
        const checkResult = await pool.query(checkQuery, [uid])
        if (checkResult.rows.length > 0) {
            // If an entry exists, throw an error
            return{ message: 'User has already applied for a block' } 
        }

        // If no entry exists, proceed to insert
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

const userSignupHelper = async (userData) => {
    const { fname, lname, email, addrs1, addrs2, city, state, zip, username, pass } = userData;
    const query = `
        INSERT INTO users (fname, lname, email, addrs1, addrs2, city, state, zip, username, pass)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING uid;
    `;

    try {
        const { rows } = await pool.query(query, [fname, lname, email, addrs1, addrs2, city, state, zip, username, pass]);
        return rows[0].uid  // This returns the user ID of the newly created user
    } catch (error) {
        if (error.code === '23505') { // 23505 is the error code for unique_violation
            if (error.detail.includes('username')){
                throw new Error('Username already in use');
            }
            if (error.detail.includes('email')){
                throw new Error('Email already in use')
            }
        }
        throw error;
    }
};

// Helper function for updateProfile
async function updateProfilesHelper(uid, f_desc, f_photo) {

    let query = `
        INSERT INTO user_profiles (uid, f_desc, f_photo)
        VALUES ($1, $2, $3)
        ON CONFLICT (uid) 
        DO UPDATE SET 
    `;

    const updateParts = []
    const values = [uid, f_desc, f_photo]

    if (f_desc !== null) {
        updateParts.push(`f_desc = $2`)
    }

    if (f_photo !== null) {
        updateParts.push(`f_photo = $3`)
    }

    // Joining all parts of the update statement
    if (updateParts.length > 0){
        query += updateParts.join(', ')
    } 
    else {
        // When there are no changes, no update occurs
        query += ' f_desc = f_desc, f_photo = f_photo'
    }


    try {
        const res = await pool.query(query, values)
        console.log(`User profile processed. Rows affected: ${res.rowCount}`)
        return res.rowCount
    } catch (err){
        console.log('Error processing user profile:', err)
        throw err
    }
}


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

    
}