// TXModal.tsx
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
    onOpening,
    onClosing,
    keepMounted = false,    // <-- default false
  } = props;

  // track if we've ever shown (for "viewed" class)
  const [isViewed, setIsViewed] = useState(false);
  // control mount/unmount only when keepMounted===false
  const [shouldRender, setShouldRender] = useState(true);
  // overlay height for smooth reveal
  const [overlayHeight, setOverlayHeight] = useState<number>();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const firstMount = useRef(true);

  // ONLY run the “mount once then unmount” hack if keepMounted is false
  useEffect(() => {
    if (keepMounted) return;

    if (firstMount.current) {
      firstMount.current = false;
      if (!show) {
        // let children mount once, then hide
        requestAnimationFrame(() => setShouldRender(false));
      }
    }
  }, [show, keepMounted]);

  useEffect(() => {
    document.body.classList.toggle('is-modal-open', show);

    if (show) {
      if (!isViewed) setIsViewed(true);
      if (!keepMounted) setShouldRender(true);

      setTimeout(() => onOpening?.(), 0);
      setTimeout(() => {
        setOverlayHeight(modalContainerRef.current?.scrollHeight);
      }, 310);
    } else {
      onClosing?.();
      // when keepMounted=false, we rely on handleAnimationEnd to unmount
    }
  }, [show, isViewed, onOpening, onClosing, keepMounted]);

  // cleanup body class
  useEffect(() => () => {
    document.body.classList.remove('is-modal-open');
  }, []);

  // ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeable && show) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeable, show, onClose]);

  const handleAnimationEnd = () => {
    if (!show && !keepMounted) {
      setShouldRender(false);
      setOverlayHeight(undefined);
    }
  };

  // if not keeping mounted and we've been told to unmount, bail out
  if (!keepMounted && !shouldRender) return null;

  return ReactDOM.createPortal(
    <Styled.Container
      ref={modalContainerRef}
      className={`modal-container ${!show ? 'hide' : ''} ${isViewed ? 'viewed' : ''}`}
      zIndex={zIndex}
      onAnimationEnd={handleAnimationEnd}
    >
      <Styled.Overlay
        onClick={() => show && closeable && onClose?.()}
        overlayHeight={overlayHeight}
        className={`${!show ? 'hide' : ''} ${isViewed ? 'viewed' : ''}`}
      />
      <Styled.ModalContainer
        size={modalWidth}
        autoWidth={autoWidth}
        show={show}
        verticalAlign={verticalAlign}
        position={position}
      >
        {closeable && showCloseIcon && (
          <Styled.CloseIcon onClick={() => onClose?.()}>
            x
          </Styled.CloseIcon>
        )}
        {children}
      </Styled.ModalContainer>
    </Styled.Container>,
    document.body
  );
};

// Static subcomponents
interface IProps {
  children: React.ReactNode;
  align?: 'right' | 'left' | 'center';
  buttonsWidth?: number;
  contentScrollable?: boolean;
  bodyStyle?: React.CSSProperties;
}
TXModal.Header = (props: IProps) => (
  <Styled.ModalHeader>{props.children}</Styled.ModalHeader>
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
