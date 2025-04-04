document.addEventListener("DOMContentLoaded", function () {
    // Lấy tất cả các tiêu đề nhóm
    const groupHeaders = document.querySelectorAll(".group-header.collapsible");

    groupHeaders.forEach(header => {
        header.addEventListener("click", function () {
            // Lấy nhóm tương ứng (to-do, in-progress, pending, done)
            const group = this.getAttribute("data-group");
            // Lấy tất cả các hàng nhiệm vụ thuộc nhóm này
            const tasks = document.querySelectorAll(`.task-row.${group}`);

            // Toggle class "collapsed" để thay đổi mũi tên
            this.classList.toggle("collapsed");

            // Hiển thị hoặc ẩn các nhiệm vụ
            tasks.forEach(task => {
                if (this.classList.contains("collapsed")) {
                    task.classList.remove("visible");
                } else {
                    task.classList.add("visible");
                }
            });
        });
    });

    // Mặc định hiển thị nhóm "To do" khi tải trang
    const defaultGroup = document.querySelector('.group-header[data-group="to-do"]');
    const defaultTasks = document.querySelectorAll('.task-row.to-do');
    if (defaultGroup && defaultTasks) {
        defaultTasks.forEach(task => {
            task.classList.add("visible");
        });
    }

    // Khởi tạo dữ liệu members trong localStorage nếu chưa có
    if (!localStorage.getItem('members')) {
        // Lấy project ID từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        // Khởi tạo với 2 thành viên mặc định
        const initialMembers = {
            [projectId]: [
                {
                    name: "An Nguyễn",
                    role: "Project owner"
                },
                {
                    name: "Bách Nguyễn",
                    role: "Frontend developer"
                }
            ]
        };
        localStorage.setItem('members', JSON.stringify(initialMembers));
    }

    // Modal thêm thành viên
    const memberModal = document.querySelector('.modal__member');
    const addMemberBtn = document.querySelector('.member-section .add-member-btn');
    console.log(addMemberBtn);
    const closeMemberButton = document.querySelector('.modal__member .close');
    const cancelMemberButton = document.querySelector('.modal__member .cancel');
    const memberForm = document.querySelector('.modal__member form');

    // Modal hiển thị danh sách thành viên
    const memberListModal = document.querySelector('.modal__member_list');
    const memberListBtn = document.querySelector('.list__member');
    const closeMemberListButton = document.querySelector('.modal__member_list .close');

    // Hàm hiển thị modal thêm thành viên
    function showMemberModal() {
        if (memberModal) {
            memberModal.style.display = 'block';
        }
    }

    // Hàm ẩn modal thêm thành viên
    function hideMemberModal() {
        if (memberModal) {
            memberModal.style.display = 'none';
            if (memberForm) memberForm.reset();
        }
    }

    // Hàm hiển thị modal danh sách thành viên
    function showMemberListModal() {
        if (memberListModal) {
            // Lấy project ID từ URL
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            
            // Lấy danh sách thành viên của project
            const members = JSON.parse(localStorage.getItem('members')) || {};
            const projectMembers = members[projectId] || [];
            
            // Render danh sách thành viên
            const memberListBody = memberListModal.querySelector('.modal__member_list-body');
            if (memberListBody) {
                if (projectMembers.length === 0) {
                    memberListBody.innerHTML = '<p class="no-members">Chưa có thành viên nào trong dự án</p>';
                } else {
                    memberListBody.innerHTML = `
                        <table class="member-table">
                            <thead>
                                <tr>
                                    <th>Tên thành viên</th>
                                    <th>Vai trò</th>
                                    <th style="text-align: center;">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${projectMembers.map((member, index) => `
                                    <tr>
                                        <td>${member.name}</td>
                                        <td>${member.role}</td>
                                        <td class="action-buttons">
                                            <button class="btn-edit" data-index="${index}">Sửa</button>
                                            <button class="btn-delete" data-index="${index}">Xóa</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;

                    // Thêm sự kiện cho các nút sửa
                    const editButtons = memberListBody.querySelectorAll('.btn-edit');
                    editButtons.forEach(button => {
                        button.addEventListener('click', () => {
                            const index = button.getAttribute('data-index');
                            editMember(index);
                        });
                    });

                    // Thêm sự kiện cho các nút xóa
                    const deleteButtons = memberListBody.querySelectorAll('.btn-delete');
                    deleteButtons.forEach(button => {
                        button.addEventListener('click', () => {
                            const index = button.getAttribute('data-index');
                            deleteMember(index);
                        });
                    });
                }
            }
            
            memberListModal.style.display = 'block';
        }
    }

    // Hàm xử lý sửa thành viên
    function editMember(index) {
        // Lấy project ID từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        // Lấy danh sách thành viên
        const members = JSON.parse(localStorage.getItem('members')) || {};
        const member = members[projectId][index];
        
        // Ẩn modal danh sách
        hideMemberListModal();
        
        // Hiển thị modal thêm thành viên với dữ liệu cũ
        if (memberForm) {
            memberForm.querySelector('[name="member-name"]').value = member.name;
            memberForm.querySelector('[name="member-role"]').value = member.role;
            
            // Lưu index của thành viên đang sửa
            memberForm.setAttribute('data-edit-index', index);
            
            // Hiển thị modal
            showMemberModal();
        }
    }

    // Hàm xử lý xóa thành viên
    function deleteMember(index) {
        if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
            // Lấy project ID từ URL
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            
            // Lấy danh sách thành viên
            const members = JSON.parse(localStorage.getItem('members')) || {};
            
            // Xóa thành viên
            members[projectId].splice(index, 1);
            
            // Lưu lại vào localStorage
            localStorage.setItem('members', JSON.stringify(members));
            
            // Hiển thị thông báo và reload trang
            showNotification('Xóa thành viên thành công!', 'success');
            window.location.reload();
        }
    }

    // Hàm ẩn modal danh sách thành viên
    function hideMemberListModal() {
        if (memberListModal) {
            memberListModal.style.display = 'none';
        }
    }

    // Xử lý sự kiện click nút thêm thành viên
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', showMemberModal);
    }

    // Xử lý sự kiện click nút xem danh sách thành viên
    if (memberListBtn) {
        memberListBtn.addEventListener('click', showMemberListModal);
    }

    // Đóng modal thêm thành viên
    if (closeMemberButton) {
        closeMemberButton.addEventListener('click', hideMemberModal);
    }

    if (cancelMemberButton) {
        cancelMemberButton.addEventListener('click', hideMemberModal);
    }

    // Đóng modal danh sách thành viên
    if (closeMemberListButton) {
        closeMemberListButton.addEventListener('click', hideMemberListModal);
    }

    // Xử lý submit form thêm thành viên
    if (memberForm) {
        memberForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Lấy project ID từ URL
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            
            // Lấy thông tin thành viên từ form
            const memberName = memberForm.querySelector('[name="member-name"]').value.trim();
            const memberRole = memberForm.querySelector('[name="member-role"]').value.trim();
            
            // Kiểm tra dữ liệu đầu vào
            if (!memberName || !memberRole) {
                showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
                return;
            }
            
            // Lấy danh sách thành viên hiện tại
            const members = JSON.parse(localStorage.getItem('members')) || {};
            
            // Khởi tạo mảng thành viên cho project nếu chưa có
            if (!members[projectId]) {
                members[projectId] = [];
            }
            
            // Kiểm tra xem đang thêm mới hay sửa
            const editIndex = memberForm.getAttribute('data-edit-index');
            
            if (editIndex !== null) {
                // Đang sửa
                // Kiểm tra trùng tên (trừ chính nó)
                const isExist = members[projectId].some((member, index) => 
                    index !== parseInt(editIndex) && 
                    member.name.toLowerCase() === memberName.toLowerCase()
                );
                
                if (isExist) {
                    showNotification('Tên thành viên đã tồn tại trong dự án!', 'error');
                    const memberNameInput = memberForm.querySelector('[name="member-name"]');
                    memberNameInput.classList.add('error');
                    memberNameInput.focus();
                    return;
                }
                
                // Cập nhật thông tin thành viên
                members[projectId][editIndex] = {
                    name: memberName,
                    role: memberRole
                };
                
                // Xóa index đang sửa
                memberForm.removeAttribute('data-edit-index');
                
                showNotification('Cập nhật thành viên thành công!', 'success');
            } else {
                // Đang thêm mới
                // Kiểm tra trùng tên
                const isExist = members[projectId].some(member => 
                    member.name.toLowerCase() === memberName.toLowerCase()
                );
                
                if (isExist) {
                    showNotification('Tên thành viên đã tồn tại trong dự án!', 'error');
                    const memberNameInput = memberForm.querySelector('[name="member-name"]');
                    memberNameInput.classList.add('error');
                    memberNameInput.focus();
                    return;
                }
                
                // Thêm thành viên mới
                members[projectId].push({
                    name: memberName,
                    role: memberRole
                });
                
                showNotification('Thêm thành viên thành công!', 'success');
            }
            
            // Lưu vào localStorage
            localStorage.setItem('members', JSON.stringify(members));
            
            // Đóng modal và reset form
            hideMemberModal();
            memberForm.reset();
            
            // Reload trang để cập nhật danh sách thành viên
            window.location.reload();
        });
    }

    // Thêm sự kiện để xóa class error khi người dùng bắt đầu nhập lại
    const memberNameInput = memberForm?.querySelector('[name="member-name"]');
    if (memberNameInput) {
        memberNameInput.addEventListener('input', () => {
            memberNameInput.classList.remove('error');
        });
    }

    // Hàm hiển thị thông báo
    function showNotification(message, type = 'success') {
        const notification = document.querySelector('.notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            if (type === 'success') {
                notification.style.backgroundColor = '#198754';
            } else if (type === 'error') {
                notification.style.backgroundColor = '#DC3545';
            }
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }
});