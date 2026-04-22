/* import { Button, Modal } from "react-bootstrap";

const ConfirmDialog = ({
  show,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Working..." : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;
 */

import { Button, Modal } from "react-bootstrap";

const ConfirmDialog = ({
  show,
  title = "Bekräfta",
  message = "Är du säker?",
  confirmText = "Ja, radera",
  cancelText = "Avbryt",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      contentClassName="bg-dark text-white border-secondary shadow-lg"
      style={{ borderRadius: "20px" }}
    >
      <Modal.Header
        closeButton
        closeVariant="white"
        className="border-secondary pb-2"
      >
        <Modal.Title className="fw-bold fs-5">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-4 text-center">
        <div className="mb-3 display-6">⚠️</div>
        <p className="text-secondary mb-0" style={{ fontSize: "1.1rem" }}>
          {message}
        </p>
      </Modal.Body>

      <Modal.Footer className="border-0 pb-4 pt-0 d-flex justify-content-center gap-2">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-pill px-4 fw-bold"
        >
          {cancelText}
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-pill px-4 fw-bold shadow-sm"
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Raderar...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;
