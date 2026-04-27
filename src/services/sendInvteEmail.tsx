import { db } from "../firebase"; // Din firebase-init
import { collection, addDoc } from "firebase/firestore";

export const sendInviteEmail = async (guestEmail, guestName, eventTitle) => {
  try {
    await addDoc(collection(db, "mail"), {
      to: guestEmail,
      message: {
        subject: `Inbjudan till ${eventTitle}!`,
        html: `<h1>Hej ${guestName}!</h1><p>Du är inbjuden till ${eventTitle}. Svara i appen!</p>`,
      },
    });
    console.log("Mail lagt i kön!");
  } catch (error) {
    console.error("Kunde inte skicka mail:", error);
  }
};
