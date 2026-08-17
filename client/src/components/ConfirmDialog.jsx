import React from "react";
import Modal from "./Modal";
import Button from "./Buttons";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button onClick={onClose} className="bg-gray-300 text-gray-700 hover:bg-gray-400">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
