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
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  // Watch `show` to mount/unmount portal container
  useEffect(() => {
    if (show) {
      // create & append portal container if not already
      if (!portalContainerRef.current) {
        const el = document.createElement('div');
        portalContainerRef.current = el;
        document.body.appendChild(el);
      }
      setShouldRender(true);
      if (!isViewed) setIsViewed(true);
      document.body.classList.add('is-modal-open');
    } else {
      document.body.classList.remove('is-modal-open');
      // Unmount will happen in handleAnimationEnd()
    }
  }, [show, isViewed]);

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

  const handleOnClose = () => {
    if (closeable && show) {
      onClose?.();
    }
  };

  // After hide-animation ends, remove portal container entirely
  const handleAnimationEnd = () => {
    if (!show && portalContainerRef.current) {
      ReactDOM.unmountComponentAtNode(portalContainerRef.current);
      document.body.removeChild(portalContainerRef.current);
      portalContainerRef.current = null;
      setShouldRender(false);
    }
  };

  // If there's nothing to render, bail out
  if (!shouldRender || !portalContainerRef.current) {
    return null;
  }

  return ReactDOM.createPortal(
    <Styled.Container
      overlayHeight={modalRef.current?.scrollHeight}
      className={`modal-container ${!show ? 'hide' : ''} ${isViewed ? 'viewed' : ''}`}
      zIndex={zIndex}
      onAnimationEnd={handleAnimationEnd}
    >
      <Styled.Overlay
        onClick={handleOnClose}
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
          <Styled.CloseIcon onClick={handleOnClose}>
            <tx-core-icon icon={closeIcon} size={iconSize} color={iconColor} />
          </Styled.CloseIcon>
        )}
        {children}
      </Styled.ModalContainer>
    </Styled.Container>,
    portalContainerRef.current
  );
};

interface IProps {
  children: any;
  align?: 'right' | 'left' | 'center';
  buttonsWidth?: number;
  contentScrollable?: boolean;
  bodyStyle?: any;
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
