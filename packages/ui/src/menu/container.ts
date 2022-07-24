let container: HTMLDivElement | null = null;

const getContainer = (): HTMLElement => {
  if (container === null) {
    container = document.createElement('div');
    container.dataset['purpose'] = 'menus';
    document.body.appendChild(container);
  }
  return container;
};

export default getContainer;
