import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { CheckCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import "./SuccessDialog.css";

const SuccessDialog = ({ message, navigateTo, delay = 3000 }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (navigateTo) navigate(navigateTo, { replace: true });
    }, delay);

    return () => clearTimeout(timer);
  }, [navigateTo, delay, navigate]);

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      centered
      backdrop="static"
      keyboard={false}
      animation={true}
    >
      <Modal.Body className="text-center py-4">
        <div className="success-dialog">
          <CheckCircle className="bounce" size={48} color="green" />
          <p style={{ color: "black" }}>{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          variant="success"
          onClick={() => {
            setShow(false);
            if (navigateTo) navigate(navigateTo, { replace: true });
          }}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuccessDialog;
