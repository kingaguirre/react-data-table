import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ITXModalInterface } from './interface';
import * as Styled from './styled';

export const TXModal = (props: ITXModalInterface) => {
  const {
    show = false,
    children,
    closeable = true,
    showCloseIcon = true,
    onClose,
    modalWidth = 'medium',
    autoWidth = false,
    verticalAlign = 'center',
    closeIcon = 'cancel',
    iconSize = '',
    iconColor = '',
    zIndex,
    position = '',
  } = props;

  // track if we've ever shown (for your "viewed" class)
  const [isViewed, setIsViewed] = useState(false);
  // control mounting/rendering of portal content
  const [shouldRender, setShouldRender] = useState(show);
  // ref to the modal container (for measuring height, etc)
  const modalRef = useRef<HTMLDivElement>(null);
  // ref to the dynamically created portal element
  const portalRef = useRef<HTMLDivElement | null>(null);

  // Mount/unmount portal container and body class management
  useEffect(() => {
    if (show && !portalRef.current) {
      const el = document.createElement('div');
      el.id = 'comp-modal-dynamic';
      document.body.appendChild(el);
      portalRef.current = el;
    }
    document.body.classList.toggle('is-modal-open', show);
    if (show && !isViewed) setIsViewed(true);
    if (show) {
      setShouldRender(true);
    }
  }, [show, isViewed]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('is-modal-open');
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, []);

  // Handle ESC key close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeable && show) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeable, show, onClose]);

  const handleAnimationEnd = () => {
    if (!show && portalRef.current) {
      document.body.removeChild(portalRef.current);
      portalRef.current = null;
      setShouldRender(false);
    }
  };

  if (!shouldRender || !portalRef.current) return null;

  return ReactDOM.createPortal(
    <Styled.Container
      overlayHeight={modalRef.current?.scrollHeight}
      className={`modal-container ${!show ? 'hide' : ''} ${isViewed ? 'viewed' : ''}`}
      zIndex={zIndex}
      onAnimationEnd={handleAnimationEnd}
    >
      <Styled.Overlay
        onClick={() => show && closeable && onClose?.()}
        overlayHeight={modalRef.current?.scrollHeight}
        className={`${!show ? 'hide' : ''} ${isViewed ? 'viewed' : ''}`}
      />
      <Styled.ModalContainer
        ref={modalRef}
        size={modalWidth}
        autoWidth={autoWidth}
        show={show}
        verticalAlign={verticalAlign}
        position={position}
      >
        {closeable && showCloseIcon && (
          <Styled.CloseIcon onClick={() => onClose?.()}>
            <tx-core-icon icon={closeIcon} size={iconSize} color={iconColor} />
          </Styled.CloseIcon>
        )}
        {children}
      </Styled.ModalContainer>
    </Styled.Container>,
    portalRef.current
  );
};

interface IProps {
  children: React.ReactNode;
  align?: 'right' | 'left' | 'center';
  buttonsWidth?: number;
  contentScrollable?: boolean;
  bodyStyle?: React.CSSProperties;
}
TXModal.Header = (props: IProps) => (
  <Styled.ModalHeader className="modal-header">{props.children}</Styled.ModalHeader>
);
TXModal.Body = (props: IProps) => (
  <Styled.ModalBody contentScrollable={!!props.contentScrollable} style={props.bodyStyle}>
    {props.children}
  </Styled.ModalBody>
);
TXModal.Footer = (props: IProps) => (
  <Styled.ModalFooter align={props.align} buttonsWidth={props.buttonsWidth}>
    {props.children}
  </Styled.ModalFooter>
);
