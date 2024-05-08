require('dotenv').config()
const express = require('express');
const cors = require('cors')
const app = express();
const db = require('./queries')
const port = 4000

app.use(express.json())
app.use(cors())


app.get('/getUserProfile/:uid', db.getUserProfile)
app.post('/updateUserProfile', db.updateProfile)
app.post('/userSignup', db.userSignup)
app.post('/userSignin', db.userSignin)
app.post('/joinBlock', db.joinBlock)
app.get('/blockFeedThreads/receivedBlock/:uid', db.blockFeedThreadsRecieved)
app.get('/blockFeedThreads/createdBlock/:uid', db.blockFeedThreadsCreated)
app.get('/neighborhoodFeedThreads/receivedNeighborhood/:uid', db.neighborhoodFeedThreadsRecieved)
app.get('/neighborhoodFeedThreads/createdNeighborhood/:uid', db.neighborhoodFeedThreadsCreated)
app.get('/friendsFeedThreads/receivedFriends/:uid', db.friendsFeedThreadsRecieved)
app.get('/friendsFeedThreads/createdFriends/:uid', db.friendsFeedThreadsCreated)
app.get('/neighborsFeedThreads/createdNeighbors/:uid', db.neighborsFeedThreadsCreated)
app.get('/neighborsFeedThreads/receivedNeighbors/:uid', db.neighborsFeedThreadsReceived)
app.post('/createThread', db.createThread)
app.get('/friendsList/:uid', db.friendsListFetch)
app.get('/neighborsList/:uid', db.neighborsListFetch)
app.get('/friendRequestsRecievedPending/:uid', db.friendRequestsReceivedPendingFetch)
app.get('/friendRequestsSentPending/:uid', db.friendRequestsSentPendingFetch)
app.get('/membershipSeekers/:uid', db.prospectiveMembersFetch)
app.get('/findNeighbors/:uid', db.findNeighborsFetch)
app.post('/addNeighborsToList', db.addNeighborsToList)
app.post('/acceptFriendRequest', db.acceptFriendRequest)



app.get('/visit', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
  console.log("ping")
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
