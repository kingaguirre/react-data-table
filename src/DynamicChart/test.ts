import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import ChartComponent from './ChartComponent'; // Adjust the import path as necessary
import { LABELS, VALUES } from './utils';

describe('ChartComponent', () => {
  const defaultProps = {
    chartHeight: '400px',
    labels: LABELS,
    values: VALUES,
    popoverWidth: 500
  };

  test('renders ChartComponent correctly', () => {
    render(<ChartComponent {...defaultProps} />);
    expect(screen.getByText(LABELS[0].title)).toBeInTheDocument();
    expect(screen.getByText(`USD ${LABELS[0].value}`)).toBeInTheDocument();
  });

  test('opens popover on value click', () => {
    render(<ChartComponent {...defaultProps} />);
    const valueElement = screen.getByText(`USD ${VALUES[0].value}`);
    userEvent.click(valueElement);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  test('closes popover on outside click', () => {
    render(<ChartComponent {...defaultProps} />);
    const valueElement = screen.getByText(`USD ${VALUES[0].value}`);
    userEvent.click(valueElement);
    expect(screen.getByText('Details')).toBeInTheDocument();

    fireEvent.click(document);
    expect(screen.queryByText('Details')).not.toBeInTheDocument();
  });

  test('closes popover on Escape key press', () => {
    render(<ChartComponent {...defaultProps} />);
    const valueElement = screen.getByText(`USD ${VALUES[0].value}`);
    userEvent.click(valueElement);
    expect(screen.getByText('Details')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Details')).not.toBeInTheDocument();
  });

  test('opens popover on Enter key press', () => {
    render(<ChartComponent {...defaultProps} />);
    const valueElement = screen.getByText(`USD ${VALUES[0].value}`);
    valueElement.focus();
    fireEvent.keyDown(valueElement, { key: 'Enter' });
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  test('opens popover on Space key press', () => {
    render(<ChartComponent {...defaultProps} />);
    const valueElement = screen.getByText(`USD ${VALUES[0].value}`);
    valueElement.focus();
    fireEvent.keyDown(valueElement, { key: ' ' });
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  test('adjusts popover position on window resize', () => {
    render(<ChartComponent {...defaultProps} />);
    const valueElement = screen.getByText(`USD ${VALUES[0].value}`);
    userEvent.click(valueElement);
    expect(screen.getByText('Details')).toBeInTheDocument();

    fireEvent.resize(window);
    // Assuming that we have a way to verify the position adjustment
    // This is a placeholder for actual position verification logic
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});
