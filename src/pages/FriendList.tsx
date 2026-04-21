import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Se till att sökvägen stämmer
import { useAuth } from "../Context/AuthContext"; // Din auth-hook
import { ListGroup, Image, Card } from "react-bootstrap";

function FriendList() {
  const [myFriends, setMyFriends] = useState([]);
  const { user } = useAuth(); // Hämtar den inloggade användaren

  useEffect(() => {
    if (!user) return;

    // Lyssnar på din sub-collection i realtid
    const friendsRef = collection(db, "users", user.uid, "friends");

    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      const friendsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyFriends(friendsList);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0">Mina vänner ({myFriends.length})</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {myFriends.length === 0 ? (
          <ListGroup.Item className="text-muted italic">
            Du har inte lagt till några vänner ännu.
          </ListGroup.Item>
        ) : (
          myFriends.map((friend) => (
            <ListGroup.Item
              key={friend.id}
              className="d-flex align-items-center justify-content-between p-3"
            >
              <div className="d-flex align-items-center">
                <Image
                  src={friend.photoURL || "https://via.placeholder.com/40"}
                  roundedCircle
                  width={40}
                  height={40}
                  className="me-3 shadow-sm"
                  style={{ objectFit: "cover" }}
                />
                <span className="fw-bold">{friend.displayName}</span>
              </div>
              {/* Här kan du senare lägga till en knapp för att "Ta bort vän" eller "Chatta" */}
              <button className="btn btn-outline-primary btn-sm">
                Visa profil
              </button>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
}

export default FriendList;
