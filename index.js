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

  // Add task functionality (single consolidated handler)
  let taskCounter = 1;
  const bigBox = document.getElementById('big-box');
  const svg = document.getElementById('connectors-svg');

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

  function updateSvgSize() {
    if (!svg || !bigBox) return;
    const w = Math.max(bigBox.scrollWidth, bigBox.clientWidth);
    const h = Math.max(bigBox.scrollHeight, bigBox.clientHeight);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.style.width = `${w}px`;
    svg.style.height = `${h}px`;
  }

  function getCenterRelative(el) {
    const elRect = el.getBoundingClientRect();
    const parentRect = bigBox.getBoundingClientRect();
    return {
      x: elRect.left - parentRect.left + elRect.width / 2 + bigBox.scrollLeft,
      y: elRect.top - parentRect.top + elRect.height / 2 + bigBox.scrollTop
    };
  }

  function drawLineBetweenCenters(fromEl, toEl, fromId, toId) {
    if (!svg || !fromEl || !toEl) return null;
    updateSvgSize();
    const p1 = getCenterRelative(fromEl);
    const p2 = getCenterRelative(toEl);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('stroke', '#0b6b4b');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    if (fromId) line.dataset.from = String(fromId);
    if (toId) line.dataset.to = String(toId);
    svg.appendChild(line);
    return line;
  }

  // Single delegated click handler for whole bigBox (add-task, future actions)
  bigBox.addEventListener('click', (ev) => {
    const clickedBtn = ev.target.closest('button');
    if (!clickedBtn) return;
    const action = clickedBtn.dataset.action;
    if (!action) return;

    if (action === 'add-task') {
      // find previous .main (last existing) before creating new
      const mains = Array.from(bigBox.querySelectorAll('.main'));
      const prevMain = mains.length ? mains[mains.length - 1] : null;

      // create and append exactly one new main box
      taskCounter += 1;
      const newMain = createNewMainTask(taskCounter);
      bigBox.appendChild(newMain);

      // resize textarea in new box
      const newTextarea = newMain.querySelector('.task-textarea');
      autoResizeTextarea(newTextarea);

      // draw connection from previous -> new (if previous exists)
      requestAnimationFrame(() => {
        if (prevMain) {
          drawLineBetweenCenters(prevMain, newMain, prevMain.id?.split('-').pop(), taskCounter);
        }
        updateSvgSize();
      });

      newMain.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // other actions (branch/delete) left unimplemented for now
  });

  // redraw lines on resize/scroll
  window.addEventListener('resize', updateSvgSize);
  bigBox.addEventListener('scroll', updateSvgSize);

  // initial svg sizing
  requestAnimationFrame(updateSvgSize);
});


