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
  let branchCounter = 0;
  const bigBox = document.getElementById('big-box');
  // ensure bigBox is positioned for absolute children
  if (bigBox) bigBox.style.position = bigBox.style.position || 'relative';
  const svg = document.getElementById('connectors-svg');

  // helper used by add-task: create a new .main block
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
      </div>
      <div class="subtasks" data-parent-id="${id}"></div>
    `;
    return mainDiv;
  }

  // SVG helpers (used for connectors). drawLineBetweenCenters used for main->main
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

  // helpers for L-connector (branch) drawing
  function getLeftCenterRelative(el) {
    const r = el.getBoundingClientRect();
    const p = bigBox.getBoundingClientRect();
    return {
      x: r.left - p.left + bigBox.scrollLeft,
      y: r.top - p.top + r.height / 2 + bigBox.scrollTop
    };
  }

  // NEW: get point on bottom edge offset 100px left from right side
  function getBottomOffsetRelative(el, offsetFromRight = 100) {
    const r = el.getBoundingClientRect();
    const p = bigBox.getBoundingClientRect();
    return {
      x: r.right - offsetFromRight - p.left + bigBox.scrollLeft,
      y: r.bottom - p.top + bigBox.scrollTop
    };
  }

  // draw L-shaped connector: start from bottom (offset 100px from right),
  // go vertically to child's center y, then horizontally to child's left center x
  function drawLConnector(parentEl, childEl, parentId, childId) {
    if (!svg || !parentEl || !childEl) return null;
    updateSvgSize();
    const p1 = getBottomOffsetRelative(parentEl, 100);
    const p2 = getLeftCenterRelative(childEl);
    const d = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y} L ${p2.x} ${p2.y}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#0b6b4b');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    if (parentId) path.dataset.from = String(parentId);
    if (childId) path.dataset.to = String(childId);
    path.dataset.type = 'L';
    svg.appendChild(path);
    return path;
  }

  // update redraw to use bottom-offset start point
  function redrawAllConnectors() {
    if (!svg) return;
    updateSvgSize();
    const paths = Array.from(svg.querySelectorAll('path[data-type="L"][data-from][data-to]'));
    paths.forEach(p => {
      const fromId = p.dataset.from;
      const toId = p.dataset.to;
      const parentEl = document.getElementById(fromId) || bigBox.querySelector(`[data-task-id="${fromId}"]`) || bigBox.querySelector(`.main[data-task-id="${fromId}"]`);
      const childEl = document.getElementById(toId) || bigBox.querySelector(`.branch-box[id="${toId}"]`) || bigBox.querySelector(`.branch-box[data-branch-id="${toId}"]`);
      if (!parentEl || !childEl) { p.remove(); return; }
      const p1 = getBottomOffsetRelative(parentEl, 100);
      const p2 = getLeftCenterRelative(childEl);
      const d = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y} L ${p2.x} ${p2.y}`;
      p.setAttribute('d', d);
    });
  }

  // Single delegated click handler for whole bigBox (add-task, add-branch, etc.)
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
        if(prevMain) {
          drawLineBetweenCenters(prevMain, newMain, prevMain.id?.split('-').pop(), taskCounter);
        }
        updateSvgSize();
      });

      newMain.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (action === 'add-branch') {
      const parentMain = clickedBtn.closest('.main');
      if (!parentMain) return;

      // avoid duplicate branch box immediately after the main (check by stored flag)
      if (parentMain.dataset.hasBranch === 'true') return;

      branchCounter += 1;
      const branch = document.createElement('div');
      branch.className = 'branch-box';
      const branchId = `branch-${branchCounter}`;
      branch.id = branchId;
      // style branch box (reduced width and border expected from CSS); position absolute so it won't expand layout
      branch.style.position = 'absolute';
      branch.style.width = '320px';
      branch.style.boxSizing = 'border-box';
      branch.style.border = '1px solid green';
      branch.style.borderRadius = '10px';
      branch.style.background = '#fff';
      branch.style.padding = '8px';

      branch.innerHTML = `
        <div class="task-row" data-branch-of="${parentMain.id || parentMain.dataset.taskId || ''}">
          <div class="task-label">Sub Task</div>
          <div class="task-top">
            <input class="round-checkbox" type="checkbox" />
            <div class="task-input">
              <textarea class="task-textarea" rows="1" wrap="soft" placeholder="Add a sub task…"></textarea>
            </div>
          </div>
          <div class="task-actions">
            <button type="button" title="Delete branch" data-action="delete-branch">
              <img src="./Style/png/Red_X.svg.png" alt="delete" />
            </button>
          </div>
        </div>
      `;

      // compute absolute position: left = parentMain left relative to bigBox + 400px
      const parentRect = parentMain.getBoundingClientRect();
      const bigRect = bigBox.getBoundingClientRect();
      const left = (parentRect.left - bigRect.left) + 400; // 400px from main's left
      const top = (parentRect.top - bigRect.top) + parentRect.height + 10; // below parent
      branch.style.left = `${left}px`;
      branch.style.top = `${top}px`;

      // append branch to bigBox so it doesn't affect Guidelines width
      bigBox.appendChild(branch);
      // mark parent to avoid duplicate immediate branch
      parentMain.dataset.hasBranch = 'true';

      // auto-resize branch textarea
      const ta = branch.querySelector('.task-textarea');
      if (ta) autoResizeTextarea(ta);

      // ensure parent has id
      if (!parentMain.id) parentMain.id = `tasks-root-${parentMain.dataset.taskId || Date.now()}`;

      // draw L-shaped connector from parentMain center-right to branch left-center
      requestAnimationFrame(() => {
        drawLConnector(parentMain, branch, parentMain.id, branchId);
        updateSvgSize();
      });

      branch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // other actions...
  });

  // redraw connectors on resize/scroll/layout change
  window.addEventListener('resize', () => {
    redrawAllConnectors();
    updateSvgSize();
  });
  bigBox.addEventListener('scroll', () => {
    redrawAllConnectors();
    updateSvgSize();
  });
  // initial svg sizing
  requestAnimationFrame(updateSvgSize);
});


