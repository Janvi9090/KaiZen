// $("#switchbtn").click(function(){
//     $(this).text("Switch Horizontally");
// });

// $("#switchbtn").click(function(){
//     $(this).text("Switch Horizontally");
// });

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('switchbtn');
  const icon = document.getElementById('switchIcon');
  const text = document.getElementById('switchText');

  if (!btn || !icon || !text) return;

  // start state
  btn.dataset.state = btn.dataset.state || 'vertical';

  btn.addEventListener('click', () => {
    const nowIsVertical = btn.dataset.state === 'vertical';

    if (nowIsVertical) {
      // Use the same image file, just rotate it 90deg
      icon.classList.add('rotated');
      text.textContent = 'Switch Horizontally';
      btn.dataset.state = 'horizontal';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      // revert rotation and text
      icon.classList.remove('rotated');
      text.textContent = 'Switch Vertically';
      btn.dataset.state = 'vertical';
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  // Auto-resize textareas: initial height 90px, grow up to 400px, no width limits, no scrollbars
  const MAX_HEIGHT_PX = 400;
  const INITIAL_HEIGHT_PX = 30;

  function autoResizeTextarea(t) {
    if (!t) return;
    t.style.boxSizing = 'border-box';
    t.style.overflow = 'hidden';      // hide scrollbars
    t.style.maxHeight = MAX_HEIGHT_PX + 'px';

    // Reset height to measure content
    t.style.height = 'auto';
    const needed = t.scrollHeight || INITIAL_HEIGHT_PX;
    const newH = Math.min(Math.max(needed, INITIAL_HEIGHT_PX), MAX_HEIGHT_PX);
    t.style.height = newH + 'px';
  }

  // Run for all existing textareas on load
  document.querySelectorAll('.task-textarea').forEach(autoResizeTextarea);

  // Adjust on user input (delegated)
  document.addEventListener('input', (e) => {
    const ta = e.target;
    if (ta && ta.classList && ta.classList.contains('task-textarea')) {
      autoResizeTextarea(ta);
    }
  });

  // If you create new task rows in JS, call autoResizeTextarea(newRow.querySelector('.task-textarea')) after inserting them.
});

  // event delegation for action buttons inside tasksRoot
  tasksRoot.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const currentTaskRow = btn.closest('.task-row');
    if (!action || !currentTaskRow) return;

    // Temporarily disable add and branch functionality
    if (action === 'add-task' || action === 'add-branch') {
      // no-op for now; keep UI buttons visible but non-functional
      // you can enable later by removing this conditional
      return;
    }

    // ...other actions (e.g. delete) can remain here or be implemented later...
  });

  const makeTaskRow = (id) => {
    const row = document.createElement('div');
    row.className = 'task-row';
    row.dataset.taskId = String(id);
    row.innerHTML = `
      <input class="round-checkbox" type="checkbox" />
      <div class="task-input">
        <textarea class="task-textarea" rows="1" placeholder="Add a task to your flow…"></textarea>
      </div>
      <div class="task-actions">
        <button type="button" title="Add new task" data-action="add-task"><img src="./Style/png/plus_sign.png" alt="add" /></button>
        <button type="button" title="Add branch (sub-task)" data-action="add-branch"><img src="./Style/png/first_arrow.png" alt="branch" /></button>
        <button type="button" title="Delete task" data-action="delete-task"><img src="./Style/png/Red_X.svg.png" alt="delete" /></button>
      </div>`;
    return row;
  };

  const makeSubTask = (parentId, subId) => {
    const sr = document.createElement('div');
    sr.className = 'subtask-row';
    sr.dataset.subId = `${parentId}-${subId}`;
    sr.innerHTML = `
      <input class="round-checkbox" type="checkbox" />
      <div style="flex:1">
        <textarea class="task-textarea" rows="1" placeholder="Sub-task name…"></textarea>
      </div>
      <div style="display:flex;gap:8px">
        <button type="button" title="Delete subtask" data-action="delete-subtask"><img src="./Style/png/Red_X.svg.png" alt="del" style="width:16px;height:16px" /></button>
      </div>
    `;
    return sr;
  };