/* eslint-disable */

import shortenString from './utils/shortenString';
import attachFileIcon from './utils/attachFileIcon';
import renderContextMenu from './contextMenu';
import renderEditFileModal from './editFileModal';

const state = {
  selectedItem: {},
  directories: [],
  currentPath: '',
};

function handleTableRowClick(item) {
  state.selectedItem = item;

console.log(state.directories)

  for (let i = 0; i < state.directories.length; i += 1) {
    const dir = state.directories[i];
    if (dir.id === item.id) dir.selected = !dir.selected;
    else dir.selected = false;
  }

  const dirObj = {
    directories: state.directories,
    path: state.currentPath,
  };

  renderTable('table', dirObj);
}

async function handleTableRowDoubleClick(item) {
  let newPath = `${item.path}/${item.name}`;
  if (item.name === '..Back') {
    newPath = `${item.path}`
  }

  let url = 'http://localhost:4000/api';

  if (item.isFolder) {
    url = `${url}/directory?path=${newPath}&requireParent=1`;
  } else {
    const arr = item.name.split('.');
    const ext = arr[arr.length - 1];
    if (ext !== 'txt') {
      alert('File does not support to view or edit!');
      return;
    }

    renderEditFileModal(item, state.currentPath, async (err, data) => {
      if (err) {
        console.log(err);
        alert(err);
      } else {
        const raw = await fetch(
          `http://localhost:4000/api/directory?path=${state.currentPath}&requireParent=1`,
        );
        const res = await raw.json();

        state.directories = res.data;
        state.currentPath = res.path;

        console.log(state.directories)

        const dirObj = {
          directories: res.data,
          path: res.path,
        };

        renderTable('table', dirObj);
      }
    });

    return;
  }

  const raw = await fetch(url);
  const res = await raw.json();
  const { data: directories, path } = res;

  state.directories = directories;

  const dirObj = {
    directories,
    path,
  };

  renderTable('table', dirObj);

  state.currentPath = path;
}

function handleContextMenuOpen(item) {
  renderContextMenu(
    'detail-panel',
    item,
    state.currentPath,
    async (err, data) => {
      if (err) {
        alert(err);
      } else {
        const raw = await fetch(
          `http://localhost:4000/api/directory?path=${state.currentPath}&requireParent=1`,
        );
        const res = await raw.json();

        state.directories = res.data;
        state.currentPath = res.path;

        const dirObj = {
          directories: res.data,
          path: res.path,
        };

        renderTable('table', dirObj);
      }
    },
  );
}

export default function renderTable(elementID, directoriesObject) {
  const tableRoot = document.getElementById(elementID);
  const source = directoriesObject.directories;
  state.currentPath = directoriesObject.path;

  // Clear UI
  tableRoot.innerHTML = '';

  if (!source || source.length === 0) {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.classList.add('text-primary');
    div.classList.add('display-4');
    div.textContent = 'Folder is empty';

    tableRoot.append(div);
    return;
  }

  state.directories = source;

  const table = document.createElement('table');
  table.classList.add('table');
  table.classList.add('table-striped');
  table.classList.add('table-hover');
  table.classList.add('table-sm');

  const thead = document.createElement('thead');
  thead.classList.add('thead-dark');
  thead.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Date Modified</th>
      <th>Type</th>
      <th>Size</th>
    </tr>  
  `;

  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  for (let i = 0; i < state.directories.length; i += 1) {
    const dir = state.directories[i];

    const tr = document.createElement('tr');
    if (dir.selected) {
      tr.classList.add('selected');
    }

    const html = `
        <td title=${dir.name}>
          <span>${
            dir.isFolder
              ? '<i class="fas fa-folder"></i>'
              : `<i class="${attachFileIcon(dir.extension)}"></i>`
          }</span>
          <span>${shortenString(dir.name)}</span>
        </td>
        ${dir.modifiedAt ? `
          <td>
            ${new Date(dir.modifiedAt).toLocaleDateString()} 
            at
            ${new Date(dir.modifiedAt).toLocaleTimeString()}
          </td>        
        ` : `<td></td>`}
        <td>${dir.isFolder ? dir.name === '..Back' ? '' : 'Folder' : 'File'}</td>
        <td>${dir.size ? `${dir.size} B` : ''}</td>
    `;

    tr.innerHTML = html;

    tr.addEventListener('click', () => {
      handleTableRowClick(dir);
    });

    tr.addEventListener('dblclick', () => {
      handleTableRowDoubleClick(dir);
    });

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);

  tableRoot.appendChild(table);
  tableRoot.addEventListener('contextmenu', () => {
    const selectedItem = state.directories.find((dir) => dir.selected === true);
    if (selectedItem) handleContextMenuOpen(selectedItem);
    else handleContextMenuOpen(null);
  });
}
