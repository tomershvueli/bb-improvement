export const modalStyle = {
  '.modal__root': {
    'align-items': 'center',
    display: 'flex',
    height: '100vh',
    'justify-content': 'center',
    left: 0,
    position: 'fixed',
    top: 0,
    width: '100vw',
    'z-index': 5,
  },
  '.modal__wrap': {
    'background-color': '#00000080',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  '.modal__content': {
    'background-color': 'var(--color-background)',
    'border-radius': '5px',
    'box-shadow': 'var(--shadow-elevation-medium)',
    height: '400px',
    padding: '10px',
    position: 'relative',
    width: '600px',
    'z-index': 2,
  },
  '.modal__close-btn': {
    cursor: 'pointer',
    position: 'absolute',
    padding: '5px',
    right: '10px',
    top: '5px',
  },
};