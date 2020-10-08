import attachContextMenuIcon from './utils/attachContextMenuIcon';

export default function renderContextMenu(
  menuElementID,
  source,
  currentPath,
  callback,
) {
  const contextMenu = document.getElementById(menuElementID);
  const items = ['New Folder', 'New File'];

  if (source) {
    if (source.attributes.editable) items.push('Edit');
    items.push('Rename', 'Delete');
  }

  items.push('Close');
  // Render context menu
  const ul = document.createElement('ul');
  ul.classList.add('detail-panel-items');

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];

    const li = document.createElement('li');
    const html = `
        <li class="detail-panel-item">
          <span><i class="${attachContextMenuIcon(
            item.toLowerCase(),
          )}"></i></span> ${item}
        </li>    
    `;

    li.innerHTML = html;
    ul.appendChild(li);
  }

  const closeItem = ul.lastElementChild;
  closeItem.classList.add('detail-panel-item--center');
  closeItem.classList.add('detail-panel-item--close');

  closeItem.addEventListener('click', function handleCloseContextMenu() {
    contextMenu.hidden = true;
  });

  ul.appendChild(closeItem);

  contextMenu.innerHTML = '';
  contextMenu.appendChild(ul);
  contextMenu.hidden = false;

  if (callback) callback();
}
