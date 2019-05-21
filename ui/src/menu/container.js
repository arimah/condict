let container = null;

const getContainer = () => {
  if (container === null) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  return container;
};

export default getContainer;
