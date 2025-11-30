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

  // Auto-resize textareas: initial height 90px, grow up to 400px
  const MAX_HEIGHT_PX = 400;
  const INITIAL_HEIGHT_PX = 30;

  function autoResizeTextarea(t) {
    if (!t) return;
    t.style.boxSizing = 'border-box';
    t.style.overflow = 'hidden';
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

  // Add task functionality
  let taskCounter = 1;

  // Create a new main task box (complete structure)
  function createNewMainTask(id) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'main';
    mainDiv.id = `tasks-root-${id}`;
    mainDiv.style.marginTop = '20px'; // spacing between boxes
    mainDiv.innerHTML = `
      <div class="task-row" data-task-id="${id}">
        <div class="task-label">Main Task</div>
        <div class="task-top">
          <input class="round-checkbox" type="checkbox" />
          <div class="task-input">
            <textarea class="task-textarea" rows="1" wrap="soft" placeholder="Add a task to your flow…"></textarea>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button type="button" title="Add new task" data-action="add-task">
          <img src="./Style/png/plus_sign.png" alt="add" />
        </button>
        <button type="button" title="Add branch (sub-task)" data-action="add-branch">
          <img src="./Style/png/first_arrow.png" alt="branch" />
        </button>
        <button type="button" title="Delete task" data-action="delete-task">
          <img src="./Style/png/Red_X.svg.png" alt="delete" />
        </button>
      </div>
      <div class="subtasks" data-parent-id="${id}"></div>
    `;
    return mainDiv;
  }

  // Event delegation for add button
  const bigBox = document.getElementById('big-box');
  
  bigBox.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'add-task') {
      taskCounter += 1;
      const newMain = createNewMainTask(taskCounter);
      bigBox.appendChild(newMain);

      // Auto-resize the new textarea
      const newTextarea = newMain.querySelector('.task-textarea');
      autoResizeTextarea(newTextarea);

      // Scroll to the new box
      newMain.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});


