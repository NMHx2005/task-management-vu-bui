// Khởi tạo dữ liệu mẫu nếu chưa có trong localStorage
if (!localStorage.getItem('projects')) {
    const initialProjects = [
        {
            id: 1,
            name: "Xây dựng website thương mại điện tử",
            startDate: "2024-02-24",
            endDate: "2024-02-27",
            status: "in-progress",
            progress: 75
        }
    ];
    localStorage.setItem('projects', JSON.stringify(initialProjects));
}

// Hàm tạo notification
function createNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        display: none;
    `;
    document.body.appendChild(notification);
    return notification;
}

// Tạo notification element
const notification = createNotification();

// Hàm hiển thị thông báo
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    notification.style.top = '70px';
    
    // Đặt màu nền dựa trên loại thông báo
    if (type === 'success') {
        notification.style.backgroundColor = '#198754';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#DC3545';
    }
    
    // Tự động ẩn sau 2 giây
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// Hàm render dự án ra bảng
function renderProjects() {
    const projectTable = document.querySelector('.project-table tbody');
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    projectTable.innerHTML = projects.map(project => `
        <tr>
            <td>${project.id}</td>
            <td>
                <div class="project-info">
                    <div class="project-name">${project.name}</div>
                </div>
            </td>
            <td class="action-buttons">
                <button class="btn-edit" data-id="${project.id}">Sửa</button>
                <button class="btn-delete" data-id="${project.id}">Xóa</button>
                <button class="btn-detail" data-id="${project.id}">Chi tiết</button>
            </td>
        </tr>
    `).join('');

    // Thêm sự kiện cho nút chi tiết
    document.querySelectorAll('.btn-detail').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-id');
            window.location.href = `project-detail.html?id=${projectId}`;
        });
    });

    // Thêm sự kiện cho nút xóa
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            deleteProject(projectId);
        });
    });

    // Thêm sự kiện cho nút sửa
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            editProject(projectId);
        });
    });
}

// Hàm gắn sự kiện cho các nút
function attachEventListeners() {
    // Gắn sự kiện cho các nút xóa
    const deleteButtons = document.querySelectorAll(".btn-delete");
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-id');
            showDeleteModal(projectId);
        });
    });
}

// Modal xóa dự án
const deleteModal = document.querySelector('.model__delete');
const closeDeleteButton = document.querySelector('.model__delete .close');
const cancelDeleteButton = document.querySelector('.model__delete .cancel-btn');
const confirmDeleteButton = document.querySelector('.model__delete .confirm-btn');

let currentProjectId = null;

// Hàm hiển thị modal xóa
function showDeleteModal(projectId) {
    currentProjectId = projectId;
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === parseInt(projectId));
    
    if (project && deleteModal) {
        const messageElement = deleteModal.querySelector('.model__delete-message');
        if (messageElement) {
            messageElement.textContent = `Bạn có chắc chắn muốn xóa dự án "${project.name}" không?`;
        }
        deleteModal.style.display = 'block';
    }
}

// Hàm ẩn modal xóa
function hideDeleteModal() {
    if (deleteModal) {
        deleteModal.style.display = 'none';
        currentProjectId = null;
    }
}

// Xử lý sự kiện xóa dự án
if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener('click', async () => {
        if (currentProjectId) {
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            const updatedProjects = projects.filter(p => p.id !== parseInt(currentProjectId));
            localStorage.setItem('projects', JSON.stringify(updatedProjects));
            
            hideDeleteModal();
            renderProjects();
            await showNotification('Xóa dự án thành công!', 'success');
            window.location.reload();
        }
    });
}

// Đóng modal xóa
if (closeDeleteButton) {
    closeDeleteButton.addEventListener('click', hideDeleteModal);
}

if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener('click', hideDeleteModal);
}

// Modal thêm dự án
const createModal = document.querySelector('.modal');
const addProjectBtn = document.querySelector(".add-project-btn");
const closeCreateButton = document.querySelector('.modal .close');
const cancelCreateButton = document.querySelector('.modal .cancel');
const createForm = document.querySelector('.modal form');

// Hàm ẩn modal thêm mới
function hideCreateModal() {
    if (createModal) {
        createModal.style.display = 'none';
        if (createForm) createForm.reset();
    }
}

// Hiển thị modal thêm mới
if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
        createModal.style.display = 'block';
    });
}

// Đóng modal thêm mới
if (closeCreateButton) {
    closeCreateButton.addEventListener('click', hideCreateModal);
}

if (cancelCreateButton) {
    cancelCreateButton.addEventListener('click', hideCreateModal);
}

// Xử lý submit form thêm mới
if (createForm) {
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectName = createForm.querySelector('[name="project-name"]').value.trim();
        const projectDescription = createForm.querySelector('[name="project-description"]').value.trim();
        
        // Kiểm tra tên dự án đã tồn tại chưa
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        const isProjectExist = projects.some(project => 
            project.name.toLowerCase() === projectName.toLowerCase()
        );

        if (isProjectExist) {
            showNotification('Tên dự án đã tồn tại!', 'error');
            return;
        }

        // Nếu tên dự án chưa tồn tại, tiếp tục thêm mới
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 2);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        const newProject = {
            id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
            name: projectName,
            description: projectDescription,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            status: "pending",
            progress: 0
        };
        
        projects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(projects));
        
        hideCreateModal();
        renderProjects();
        showNotification('Thêm dự án thành công!', 'success');
        window.location.reload();
    });
}

// Render dự án khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
});

// Task deletion functionality
document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll(".btn-delete");
    const deleteModal = document.querySelector('.model__delete');
    const closeButton = document.querySelector('.model__delete .close');
    const cancelButton = document.querySelector('.model__delete .cancel-btn');
    const confirmButton = document.querySelector('.model__delete-footer .delete-btn');
    const notification = document.querySelector('.notification');

    let currentTaskRow = null;
    let currentTaskId = null;

    function showDeleteModal(taskRow) {
        if (deleteModal) {
            deleteModal.style.display = 'block';
            currentTaskRow = taskRow;
            currentTaskId = taskRow.querySelector('.btn-delete').getAttribute('data-id');
            
            const taskName = taskRow.querySelector('.project-name').textContent;
            const messageElement = deleteModal.querySelector('.model__delete-message');
            if (messageElement) {
                messageElement.textContent = `Bạn có chắc chắn muốn xóa dự án "${taskName}" không?`;
            }
        }
    }

    function hideDeleteModal() {
        if (deleteModal) {
            deleteModal.style.display = 'none';
            currentTaskRow = null;
            currentTaskId = null;
        }
    }

    function showNotification(message, type = 'success') {
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            notification.style.top = '70px';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const taskRow = button.closest('tr');
            showDeleteModal(taskRow);
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', hideDeleteModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', hideDeleteModal);
    }

    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            if (currentTaskRow && currentTaskId) {
                // Xóa từ localStorage
                const projects = JSON.parse(localStorage.getItem('projects')) || [];
                const updatedProjects = projects.filter(p => p.id !== parseInt(currentTaskId));
                localStorage.setItem('projects', JSON.stringify(updatedProjects));

                // Xóa từ giao diện
                currentTaskRow.remove();
                hideDeleteModal();
                
                showNotification('Xóa dự án thành công!', 'success');
                window.location.reload();
            }
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                hideDeleteModal();
            }
        });
    }
});

// Task group collapse functionality
document.addEventListener('DOMContentLoaded', function() {
    const groupHeaders = document.querySelectorAll('.group-header');
    
    groupHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const groupName = header.getAttribute('data-group');
            const taskRows = document.querySelectorAll(`.task-row.${groupName}`);
            
            header.classList.toggle('collapsed');
            taskRows.forEach(row => {
                row.style.display = header.classList.contains('collapsed') ? 'none' : 'table-row';
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Load dữ liệu từ localStorage
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    // Xử lý xóa dự án
    function deleteProject(projectId) {
        if (confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
            const index = projects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                projects.splice(index, 1);
                localStorage.setItem('projects', JSON.stringify(projects));
                showNotification('Xóa dự án thành công!', 'success');
                renderProjects();
            }
        }
    }

    // Xử lý sửa dự án
    function editProject(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const modal = document.querySelector('.modal');
            const form = modal.querySelector('form');
            
            // Điền thông tin vào form
            form.querySelector('[name="project-name"]').value = project.name;
            form.querySelector('[name="project-description"]').value = project.description || '';
            
            // Thêm data-edit-id để biết đang sửa project nào
            form.setAttribute('data-edit-id', projectId);
            
            // Hiển thị modal
            modal.style.display = 'block';
        }
    }

    // Xử lý submit form khi sửa
    if (createForm) {
        createForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const editId = this.getAttribute('data-edit-id');
            const projectName = this.querySelector('[name="project-name"]').value.trim();
            const projectDescription = this.querySelector('[name="project-description"]').value.trim();
            
            if (editId) {
                // Đang sửa
                const projectId = parseInt(editId);
                const project = projects.find(p => p.id === projectId);
                
                if (project) {
                    // Kiểm tra trùng tên (trừ chính nó)
                    const isExist = projects.some(p => 
                        p.id !== projectId && 
                        p.name.toLowerCase() === projectName.toLowerCase()
                    );
                    
                    if (isExist) {
                        showNotification('Tên dự án đã tồn tại!', 'error');
                        return;
                    }
                    
                    // Cập nhật thông tin
                    project.name = projectName;
                    project.description = projectDescription;
                    
                    // Lưu vào localStorage
                    localStorage.setItem('projects', JSON.stringify(projects));
                    
                    // Xóa data-edit-id
                    this.removeAttribute('data-edit-id');
                    
                    // Đóng modal và hiển thị thông báo
                    hideCreateModal();
                    showNotification('Cập nhật dự án thành công!', 'success');
                    renderProjects();
                }
            }
        });
    }

    // Khởi tạo hiển thị ban đầu
    renderProjects();
});

