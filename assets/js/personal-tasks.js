document.addEventListener('DOMContentLoaded', function() {
    // Load dữ liệu từ localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    // Hàm lấy tên dự án từ projectId
    function getProjectName(projectId) {
        const project = projects.find(p => p.id === projectId);
        return project ? project.projectName : '';
    }

    // Hàm lấy tên người được giao từ assigneeId
    function getAssigneeName(projectId, assigneeId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const member = project.members.find(m => m.userId === assigneeId);
            return member ? member.name : '';
        }
        return '';
    }

    // Hàm format ngày tháng
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    // Hàm render nhiệm vụ theo nhóm
    function renderTasks() {
        const statusGroups = ['To do', 'In progress', 'Pending', 'Done'];
        
        statusGroups.forEach(status => {
            const groupTasks = tasks.filter(task => task.status === status);
            const tbody = document.querySelector(`tr[data-group="${status.toLowerCase().replace(' ', '-')}"]`)
                .nextElementSibling;
            
            if (tbody) {
                tbody.innerHTML = groupTasks.map(task => `
                    <tr class="task-row ${status.toLowerCase().replace(' ', '-')}" data-task-id="${task.id}">
                        <td>${task.taskName}</td>
                        <td><span class="priority-tag ${task.priority.toLowerCase()}">${task.priority}</span></td>
                        <td>
                            <span class="process-status" data-task-id="${task.id}">
                                ${task.status}
                                <img src="../assets/images/process.svg" class="status-toggle" />
                            </span>
                        </td>
                        <td>${formatDate(task.assignDate)}</td>
                        <td>${formatDate(task.dueDate)}</td>
                        <td><span class="status-tag ${task.progress.toLowerCase().replace(' ', '-')}">${task.progress}</span></td>
                    </tr>
                `).join('');
            }
        });

        // Thêm sự kiện click cho các nút chuyển trạng thái
        document.querySelectorAll('.status-toggle').forEach(button => {
            button.addEventListener('click', handleStatusToggle);
        });
    }

    // Hàm xử lý chuyển đổi trạng thái
    function handleStatusToggle(event) {
        const statusElement = event.target.closest('.process-status');
        const taskId = parseInt(statusElement.getAttribute('data-task-id'));
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            // Xác định trạng thái tiếp theo
            const statusFlow = {
                'To do': 'In progress',
                'In progress': 'Pending',
                'Pending': 'Done',
                'Done': 'To do'
            };
            
            // Cập nhật trạng thái
            task.status = statusFlow[task.status];
            
            // Lưu vào localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Hiển thị thông báo
            showNotification(`Đã cập nhật trạng thái thành ${task.status}`, 'success');
            
            // Render lại danh sách
            renderTasks();
        }
    }

    // Hàm hiển thị thông báo
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 4px;
            color: white;
            z-index: 1000;
            background-color: ${type === 'success' ? '#198754' : '#DC3545'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Khởi tạo hiển thị ban đầu
    renderTasks();

    // Xử lý sự kiện collapse/expand cho các nhóm
    document.querySelectorAll('.group-header.collapsible').forEach(header => {
        header.addEventListener('click', function() {
            const group = this.getAttribute('data-group');
            const tasks = document.querySelectorAll(`.task-row.${group}`);
            
            this.classList.toggle('collapsed');
            tasks.forEach(task => {
                if (this.classList.contains('collapsed')) {
                    task.style.display = 'none';
                } else {
                    task.style.display = '';
                }
            });
        });
    });
});
