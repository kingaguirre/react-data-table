import React, { ReactNode } from 'react'
import { Container, ContentContainer } from './styled';

interface IProps {
  children?: ReactNode;
}
export default (props: IProps) => (
  <Container>
    <ContentContainer>{props.children}</ContentContainer>
  </Container>
)