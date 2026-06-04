from sqlalchemy import text


class AuthQueries:
    GET_USER_BY_EMAIL = text("""
        SELECT u.id, u.email, u.password_hash, u.full_name, r.name AS role
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE u.email = :email
    """)


class TaskQueries:
    GET_BY_ID = text("""
        SELECT id, title, description, status, assigned_to, created_by, created_at, updated_at
        FROM tasks WHERE id = :id
    """)

    INSERT = text("""
        INSERT INTO tasks (title, description, status, assigned_to, created_by)
        VALUES (:title, :description, 'pending', :assigned_to, :created_by)
    """)

    UPDATE_STATUS = text("""
        UPDATE tasks SET status = :status WHERE id = :id
    """)

    GET_USER_BY_ID = text("""
        SELECT id FROM users WHERE id = :id
    """)


class DocumentQueries:
    INSERT = text("""
        INSERT INTO documents (title, filename, storage_path, content_text, uploaded_by)
        VALUES (:title, :filename, :storage_path, :content_text, :uploaded_by)
    """)

    LIST = text("""
        SELECT id, title, filename, uploaded_at, uploaded_by
        FROM documents ORDER BY uploaded_at DESC
    """)

    GET_BY_ID = text("""
        SELECT id, title, filename, storage_path, content_text, uploaded_by, uploaded_at, vector_id
        FROM documents WHERE id = :id
    """)

    UPDATE_VECTOR_ID = text("""
        UPDATE documents SET vector_id = :vid WHERE id = :id
    """)
