import styled from 'styled-components';

export const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
    transform: none;
  }
`;
