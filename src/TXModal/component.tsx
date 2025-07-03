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
  } = props;

  // track if we've ever shown (for your "viewed" class)
  const [isViewed, setIsViewed] = useState(false);
  // control mounting/rendering of portal content
  const [shouldRender, setShouldRender] = useState(true);
  // overlay height for smooth reveal animation
  const [overlayHeight, setOverlayHeight] = useState<number | undefined>(undefined);

  // ref to the modal container (for measuring height, etc)
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // skip first-hide until after initial mount
  const firstMount = useRef(true);

  // 1) mount once on first page load, then if show===false immediately hide
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      if (!show) {
        // let children mount once so their useEffect runs, then hide
        requestAnimationFrame(() => setShouldRender(false));
      }
    }
  }, [show]);

  // 2) on every show toggle: body class, onOpening/onClosing, mount/unmount
  useEffect(() => {
    document.body.classList.toggle('is-modal-open', show);

    if (show) {
      if (!isViewed) setIsViewed(true);
      setShouldRender(true);

      // delay 0 so modal is in DOM before calling onOpening
      setTimeout(() => {
        onOpening?.();
      }, 0);

      // measure height after your CSS animation (300ms + small buffer)
      setTimeout(() => {
        setOverlayHeight(modalContainerRef.current?.scrollHeight);
      }, 310);
    } else {
      onClosing?.();
      // normal unmount happens in handleAnimationEnd
    }
  }, [show, isViewed, onOpening, onClosing]);

  // 3) clean up body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('is-modal-open');
    };
  }, []);

  // 4) handle ESC key close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeable && show) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeable, show, onClose]);

  // when the hide animation finishes, unmount portal
  const handleAnimationEnd = () => {
    if (!show) {
      setShouldRender(false);
      setOverlayHeight(undefined);
    }
  };

  if (!shouldRender) return null;

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
            {/* <tx-core-icon icon={closeIcon} size={iconSize} color={iconColor} /> */}
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
