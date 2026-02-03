import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 90%;
  max-width: 500px;
  position: relative;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <Overlay onClick={handleOverlayClick}>
            <ModalContainer>
                <CloseButton onClick={onClose}><FaTimes /></CloseButton>
                <Title>{title}</Title>
                {children}
            </ModalContainer>
        </Overlay>
    );
};

export default Modal;
