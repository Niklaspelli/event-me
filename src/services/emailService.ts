import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

// Din befintliga funktion för inbjudningar
export const sendInviteEmail = async (guestEmail, guestName, eventTitle) => {
  try {
    await addDoc(collection(db, "mail"), {
      to: guestEmail,
      message: {
        subject: `Inbjudan till ${eventTitle}!`,
        html: `<h1>Hej ${guestName}!</h1><p>Du är inbjuden till ${eventTitle}. Svara i appen!</p>`,
      },
    });
  } catch (error) {
    console.error("Kunde inte skicka mail:", error);
  }
};

// NY FUNKTION: För när eventet ställs in
export const sendCancelEmail = async (guestEmail, eventTitle) => {
  try {
    await addDoc(collection(db, "mail"), {
      to: guestEmail,
      message: {
        subject: `INSTÄLLT: ${eventTitle}`,
        html: `
          <h1>Tråkiga nyheter...</h1>
          <p>Eventet <strong>${eventTitle}</strong> har blivit inställt av arrangören.</p>
          <p>Hoppas vi ses på ett annat event snart!</p>
        `,
      },
    });
    console.log(`Avbokningsmail lagt i kön för ${guestEmail}`);
  } catch (error) {
    console.error("Kunde inte skicka avbokningsmail:", error);
  }
};
