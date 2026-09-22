"use client";

import React from "react";
import { Modal as BaseModal } from "@/components/ui/Modal";

export interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: number;
}

export function Modal({ title, onClose, children, width = 560 }: ModalProps): React.JSX.Element {
    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={title}
            width={width}
        >
            {children}
        </BaseModal>
    );
}

export default Modal;