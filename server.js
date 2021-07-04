const express = require('express');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const app = express();
const path = require('path');
const webpush = require('web-push');
const publicKey = 'BG0tkBrKppSaeZsI8srag-Ri4-VkVttOuqqJCfoUybIePBIkD9syOlyaAHseE_qprn-hDGbSMUDqoNrskREJcK0';
const privateKey = 'TzJw4WmFSwfBizWtyOkRo8Q17bHYCr4XgTsOO5UdFzs';
/*const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);*/
const site_url = 'https://airhostswap.com/'
// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

var coptions = {
  key: fs.readFileSync(__dirname+'/https/privkey.pem'),
  cert: fs.readFileSync(__dirname+'/https/cert.pem'),
  ca: fs.readFileSync(__dirname+'/https/fullchain.pem'),
  requestCert: false,
  rejectUnauthorized: false
}; 


var port = 8443;
const server = https.createServer(coptions, app);


//const server = require('http').createServer(app);

/*const server = https.createServer({
  key: fs.readFileSync('https/server.key'),
  cert: fs.readFileSync('https/server.cert')
}, app);*/

const io = require('socket.io')(server);
const FCM = require('fcm-node');

const serverKey = 'AAAARLS_MfE:APA91bGWzGvXlmijeoMvQ2V0eiBmLKWNkTTBT5s63NTPWcye4_vBDwtgTM6qkhGqLAD1k3WMoIXDvrRsbNNWrh6PPVsdygsYqqpv7W36PSu8fb_71Qikx4gog_j7JhV1L8TwoFWDdrHy';
const fcm = new FCM(serverKey);

const connection = mysql.createConnection({
  	host: 'localhost',
    user: 'airhostswap_user',
    password: 'ChamP@567air',
    database: 'airhostswap'
});
connection.connect();

server.listen(port, function () {
    console.log('Server listening at port %d', port);
  	 setInterval(function () { 
        connection.query('SELECT * FROM node', function (error, results, fields) {
	        if (error){
	          throw error;
	        } else {
            const utc = (new Date(new Date())).toUTCString();
            let datetime = new Date(utc).toISOString().replace(/T/, ' ').replace(/\..+/, '');
	      	
	        }
	    });
    }, 5000); 
  	 
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

const numUsers = 0;
function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
          case "\0":
              return "\\0";
          case "\x08":
              return "\\b";
          case "\x09":
              return "\\t";
          case "\x1a":
              return "\\z";
          case "\n":
              return "\\n";
          case "\r":
              return "\\r";
          case "\"":
          case "'":
          case "\\":
          case "%":
            return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

io.on('connection', function (socket) {
  const addedUser = false;
  // when the client emits 'new-message', this listens and executes
  socket.on('new-message', function (data) {
    // we tell the client to execute 'new-message'

    let sender_id = data.sender_id;
    let receiver_id = data.receiver_id;
    let room_id = data.room_id;
    let booking_message = data.booking_message;
    let pre_approved_message = data.pre_approved_message;
    let finalize_message = data.finalize_message;
    let booking_request_id = data.booking_request_id;
    let is_flag = data.is_flag;

    const utc = (new Date(new Date())).toUTCString();
    let datetime = new Date(utc).toISOString().replace(/T/, ' ').replace(/\..+/, '');    
 

    

  /*let new_date = new Date(); 
    let c_year = new_date.getFullYear();
    let c_month = new_date.getMonth() +1;
    let c_days = new_date.getDate();
    let hours = new_date.getHours();
    let minutes = new_date.getMinutes();
    let seconds = new_date.getSeconds();
    let strTime = hours+':'+ minutes+':'+seconds;
    let datetime = c_year+'-'+c_month+'-'+c_days+' '+strTime;*/

    const msg = mysql_real_escape_string(data.message); 
    console.log(msg);
    // const msg = message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    if( room_id ) {
      connection.query("INSERT INTO messages ( room_id , sender_id, message, booking_message, pre_approved_message, finalize_message, created_at ) VALUES ('"+room_id+"','"+sender_id+"','"+msg+"','"+booking_message+"','"+pre_approved_message+"','"+finalize_message+"','"+datetime+"')", function (error, results1, fields) {
                        
        if ( error ){
          throw error;
        } else {
         /* connection.query("UPDATE rooms SET updated_at = '"+datetime, function (error, results12, fields) {
            if (error) {
              throw error; 
            } else {
              
            }

          });
*/

          connection.query("UPDATE rooms SET updated_at = '"+datetime+"',is_chat_start = 'Yes' WHERE id = "+room_id, function (error, results1, fields) {
            if (error) {
              throw error; 
            } else {
              
              connection.query('SELECT * FROM messages WHERE room_id="'+room_id+'" ORDER BY id DESC', function (error, rresults, fields) {
              
                if (error){
                  throw error;
                } else {

                  if (rresults.length > 0) {

  	                connection.query('SELECT * FROM rooms WHERE id="'+room_id+'"', function (error, roomresults, fields) {

  		                if (error){
  		                  throw error;
  		                } else {

  		                	if (roomresults.length > 0) {
  			                	
  			                	if (rresults[0].sender_id == roomresults[0].receiver_id) {
  				                    connection.query("UPDATE rooms SET updated_at = '"+datetime+"',is_replied = 'Yes' WHERE id = "+room_id, function (error, results12, fields) {

  					                    if (error) {
  					                      throw error; 
  					                    } else {
  					                      
  					                    }

  				                    });

  			                    } else {
  			                      
  			                    }

  		                	} else {
  		                	  
  		                	}
  		                }

  	                });

                  } else {
                    
                  }

                }

              });


              connection.query('SELECT * FROM users WHERE id="'+receiver_id+'"', function (error, uresults, fields) {

                if (error){
                  throw error;
                } else {

                  if(uresults.length > 0){
                    connection.query('SELECT * FROM users WHERE id="'+sender_id+'"', function (error, sresults, fields) {
                      if (error) {
                        throw error; 
                      } else {

                        if ( sresults.length > 0 ) {
                          sresults.forEach(function(el1, index) {  
                            uresults.forEach(function(el, index1) {
                              
                              const device_token = el.device_token;
                              const device_type = el.device_type;
                              const sender_name = el1.first_name+' '+el1.last_name;
                              const user_type = el1.user_type;
                              const profile_image = el1.profile_image;
                              const xs_image_url = 'https://airhostswap.com/';
                              const local_image_url = 'http://192.168.1.61/';

                              if(user_type == 'User' && el1.profile_image) {
                                const sender_img = xs_image_url+'public/uploads/user/'+el1.profile_image;
                              } else if (user_type == 'Agent' && el1.profile_image) {
                                const sender_img = xs_image_url+'public/uploads/agent/'+el1.profile_image;
                              } else {
                                const sender_img = xs_image_url+'public/images/nouser.jpeg';
                              }
                             
                              if( device_token ) {

                                if(device_type == "ios"){
                                  let tokens = [device_token];

                                  let note = new apn.Notification({
                                    alert:  data.message,

                                  });
                                  
                                  note.payload = {"notification_type" : "message", "profile_image" : sender_img, "sender_id" : sender_id, "title" : sender_name, "room_id":room_id};
                                 /* notificationServices.send(note, tokens).then( result => {
                                    
                                    
                                    
                                  });*/

                                  socket.to(room_id).emit('new-message', {
                                    username:socket.username,
                                    booking_request_id:booking_request_id,
                                    booking_message:booking_message,
                                    pre_approved_message:pre_approved_message,
                                    finalize_message:finalize_message,
                                    message: data.message,
                                    room_id: room_id,
                                    profile_image:sender_img,
                                    receiver_id:receiver_id,
                                    is_flag:is_flag,

                                  });

                                  io.emit('new-message-header', {
                                    username:socket.username,
                                    booking_request_id:booking_request_id,
                                    booking_message:booking_message,
                                    pre_approved_message:pre_approved_message,
                                    finalize_message:finalize_message,
                                    message: data.message,
                                    room_id: room_id,
                                    profile_image:sender_img,
                                    receiver_id:receiver_id,
                                    is_flag:is_flag,

                                  });


                                } else if(device_type == "android") {
                                  
                                  const fcm_message = {
                                    to: device_token, // required fill with device token or topics
                                    data: {
                                      notification_type: 'message',
                                      message:data.message,
                                      profile_image:sender_img,
                                      sender_id:sender_id,
                                      title: sender_name,
                                      user_name: sender_name,
                                    }
                                  };

                                  //callback style
                                  fcm.send(fcm_message, function(err, response){
                                    if (err) {
                                      
                                    } else {
                                      // 
                                    }
                                    socket.to(room_id).emit('new-message', {
                                      username:sender_name,
                                      booking_request_id:booking_request_id,
                                      booking_message:booking_message,
                                      pre_approved_message:pre_approved_message,
                                      finalize_message:finalize_message,
                                      message: data.message,
                                      room_id: room_id,
                                      profile_image:sender_img,
                                      receiver_id:receiver_id,
                                      is_flag:is_flag,
                                    });

                                    io.emit('new-message-header', {
                                      username:sender_name,
                                      booking_request_id:booking_request_id,
                                      booking_message:booking_message,
                                      pre_approved_message:pre_approved_message,
                                      finalize_message:finalize_message,
                                      message: data.message,
                                      room_id: room_id,
                                      profile_image:sender_img,
                                      receiver_id:receiver_id,
                                      is_flag:is_flag,
                                    });

                                    
                                  });
                                } else {
                                  // 
                                  /*const message = {
                                    to: device_token, // required fill with device token or topics
                                    data: {
                                        notification_type: 'message',
                                        message:data.message,
                                        profile_image:sender_img,
                                        sender_id:sender_id,
                                        title: sender_name,
                                        user_name: sender_name
                                    }
                                  };*/

                                  socket.to(room_id).emit('new-message', {
                                    username:socket.username,
                                    booking_request_id:booking_request_id,
                                    booking_message:booking_message,
                                    pre_approved_message:pre_approved_message,
                                    finalize_message:finalize_message,
                                    message: data.message,
                                    room_id: room_id,
                                    profile_image:sender_img,
                                    receiver_id:receiver_id,
                                    is_flag:is_flag,
                                  });

                                  io.emit('new-message-header', {
                                    username:socket.username,
                                    booking_request_id:booking_request_id,
                                    booking_message:booking_message,
                                    pre_approved_message:pre_approved_message,
                                    finalize_message:finalize_message,
                                    message: data.message,
                                    room_id: room_id,
                                    profile_image:sender_img,
                                    receiver_id:receiver_id,
                                    is_flag:is_flag,
                                  });
                                }
                              } else {
                                
                                socket.to(room_id).emit('new-message', {
                                  username:socket.username,
                                  booking_request_id:booking_request_id,
                                  booking_message:booking_message,
                                  pre_approved_message:pre_approved_message,
                                  finalize_message:finalize_message,
                                  message: data.message,
                                  room_id: room_id,
                                  profile_image: data.profile_image,
                                  receiver_id:receiver_id,
                                  is_flag:is_flag,
                                });

                                io.emit('new-message-header', {
                                  username:sender_id,
                                  booking_request_id:booking_request_id,
                                  booking_message:booking_message,
                                  pre_approved_message:pre_approved_message,
                                  finalize_message:finalize_message,
                                  message: data.message,
                                  room_id: room_id,
                                  profile_image: data.profile_image,
                                  receiver_id:receiver_id,
                                  is_flag:is_flag,
                                });
                              }
                            });
                          });
                        } else {

                          
                          socket.to(room_id).emit('new-message', {
                            username:socket.username,
                            booking_request_id:booking_request_id,
                            booking_message:booking_message,
                            pre_approved_message:pre_approved_message,
                            finalize_message:finalize_message,
                            message: data.message,
                            room_id: room_id,
                            profile_image: data.profile_image,
                            receiver_id:receiver_id,
                            is_flag:is_flag,
                          });


                          io.emit('new-message-header', {
                            username:sender_id,
                            booking_request_id:booking_request_id,
                            booking_message:booking_message,
                            pre_approved_message:pre_approved_message,
                            finalize_message:finalize_message,
                            message: data.message,
                            room_id: room_id,
                            profile_image: data.profile_image,
                            receiver_id:receiver_id,
                            is_flag:is_flag,
                          });
                        }
                      }
                    });
                  } else {
                    socket.to(room_id).emit('new-message', {
                      username:socket.username,
                      booking_request_id:booking_request_id,
                      booking_message:booking_message,
                      pre_approved_message:pre_approved_message,
                      finalize_message:finalize_message,
                      message: data.message,
                      room_id: room_id,
                      profile_image:sender_img,
                      receiver_id:receiver_id,
                      is_flag:is_flag,
                    }); 

                    io.emit('new-message-header', {
                      username:socket.username,
                      booking_request_id:booking_request_id,
                      booking_message:booking_message,
                      pre_approved_message:pre_approved_message,
                      finalize_message:finalize_message,
                      message: data.message,
                      room_id: room_id,
                      profile_image:sender_img,
                      receiver_id:receiver_id,
                      is_flag:is_flag,
                    }); 
                  }
                }
              });
            }
          });
        }
      });
    }
  });

  // when the client emits 'add-user', this listens and executes
  socket.on('add-user', function (data) {
    // we tell the client to execute 'new-message'
    
    let sender_id = data.sender_id;
    let receiver_id = data.receiver_id;
    let booking_id = data.booking_id;
    
    let datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
    connection.query('SELECT * FROM rooms where ((sender_id="'+sender_id+'" AND receiver_id="'+receiver_id+'") OR (receiver_id="'+sender_id+'" AND sender_id="'+receiver_id+'")) AND booking_request_id="'+booking_id+'"', function (error, results, fields) {

      if (error){
          throw error;
      } else {

        if (results.length > 0){
          
          results.forEach(function(el, index) {
            let room_id = el.id;
            
            socket.username = sender_id;
            socket.join(room_id);

            socket.emit('login', {
              room_id: room_id
            });

            socket.to(room_id).emit('add-user', {
              username: sender_id,
              room_id: room_id
            });
          });
            
        } else {
          /*connection.query("INSERT INTO rooms ( sender_id , receiver_id, created_at ) VALUES ('"+sender_id+"','"+receiver_id+"','"+datetime+"')", function (error, results1, fields) {
                    
            if ( error ) {
              throw error;
            } else {
              let room_id = results1.insertId;
              socket.username = sender_id;
              socket.join(room_id);

              socket.emit('login', {
                room_id: room_id
              });

              socket.to(room_id).emit('add-user', {
                username: sender_id,
                room_id: room_id
              });
            }
            
          });*/
        }
      }
    });
  });

  socket.on('new-notification', function(data) {
   
    let room_id = data.room_id;
   // 
    //if(room_id){
      /*io.sockets.emit( 'show-notification', { 
        room_id: room_id,
        title: data.title, 
        message: data.message, 
        icon: data.icon, 
        sound: data.sound, 
        receiver_id: data.receiver_id,
        user_name: data.user_name 
      });*/

   // }

      var receiver_id = data.receiver_id; 
      var booking_request_id = data.booking_request_id;
      connection.query('SELECT * FROM users WHERE id="'+data.receiver_id+'"', function (error, sresults, fields) {
        if (error) {
          throw error; 
        } else {

          if ( sresults.length > 0 ) {
            sresults.forEach(function(el1, index) {
              var notification_payload = el1.notification_payload;

              if (notification_payload && notification_payload != '') {

                // var sub = JSON.parse(notification_payload);
                // webpush.setVapidDetails('mailto:airhostswap@mailinator.com', publicKey, privateKey);

                // const payLoad = {
                //   notification: {
                //     data: { url: 'https://xsdemo.com/airhostswap' },
                //     title: 'Airhostswap',
                //     vibrate: [100, 50, 100],
                //     icon: 'assets/icons/icon-72x72.png',
                //     body: 'New message from '+data.user_name
                //   },
                // };

          var redirect_url = site_url+'message?id='+booking_request_id+'&booking_filter=&is_archived=No';

                // webpush.sendNotification(sub, JSON.stringify(payLoad));
          var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
			        to: notification_payload, 
			        collapse_key: 'green',
			        
			        notification: {
			            title: 'Airhostswap', 
			            body: 'New message from '+data.user_name,
                  icon: site_url+'assets/icons/icon-72x72.png',
                  sound: 'default',
                  url: redirect_url,
			        },
			        
			        data: {  //you can send only notification or only data(or include both)
               title: 'Airhostswap', 
               body: 'New message from '+data.user_name,
               icon: site_url+'assets/icons/icon-72x72.png',
               sound: 'default',
               url: redirect_url
             }
			    };
			    
			    fcm.send(message, function(err, response){
			        if (err) {
			            console.log("Something has gone wrong!");
			        } else {
			            console.log("Successfully sent with response: ", response);
			        }
			    });
              }
            });
          } else {

          }
        }
      });
  });

  socket.on('send-request', function(data) {
    let room_id = data.room_id;
    
    io.emit('new-message-header', {
      username:data.sender_id,
      booking_request_id:data.booking_request_id,
      booking_message:data.booking_message,
      pre_approved_message:data.pre_approved_message,
      finalize_message:data.finalize_message,
      message: data.message,
      room_id: room_id,
      profile_image:data.sender_img,
      receiver_id:data.receiver_id,
      is_flag:data.is_flag,
    }); 
  });

  socket.on('message-read', function(data) {
    
    let room_id = data.room_id;
    let sender_id = data.sender_id;
    let receiver_id = data.receiver_id;
    let fname = data.fname;
    let lname = data.lname;
    let image = data.image;
    let session_user_id = data.session_user_id;
    
    
    
    
    if (data.booking_request_id && session_user_id == receiver_id) {
    	const utc = (new Date(new Date())).toUTCString();
        let datetime = new Date(utc).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    	
      io.sockets.emit('message-checked', { 
        room_id: room_id,
        sender_id: sender_id,
        receiver_id: receiver_id,  
        fname: fname,  
        lname: lname,  
        image: image,  
      });

      	connection.query('SELECT * FROM rooms WHERE id="'+room_id+'"', function (error, roomresults, fields) {

            if (error){
              throw error;
            } else {

            	if (roomresults.length > 0) {
                	
                    connection.query("UPDATE messages SET updated_at = '"+datetime+"',new_message = 'No' WHERE room_id = "+room_id, function (error, results12, fields) {

	                    if (error) {
	                      throw error; 
	                    } else {
	                      
	                    }

                    });

            	} else {
            	  
            	}
            }

       	});


    }

  });



/*socket.on('add-user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    io.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });*/
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function (data) {
    let room_id = data.room_id;
    
    socket.to(room_id).emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop-typing', function (data) {
    
    let room_id = data.room_id;
    socket.to(room_id).emit('stop-typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function (data) {
   
    let room_id = data.room_id;
    socket.leave(room_id);
    // echo globally that this client has left
    /*socket.to(room_id).emit('user left', {
      username: socket.username,
      numUsers: numUsers
    });*/
  });
  // // when the user disconnects.. perform this
  // socket.on('disconnect', function () {
  //   if (addedUser) {
  //     --numUsers;

  //     // echo globally that this client has left
  //     io.emit('user left', {
  //       username: socket.username,
  //       numUsers: numUsers
  //     });
  //   }
  // });
});

