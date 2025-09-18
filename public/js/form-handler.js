// ===== ARCHIVO form-handler.js (VERSIÓN FINAL SIMPLIFICADA) =====
const FormModel = {
    config: {
        minNameLength: 2, maxNameLength: 100, minCommentLength: 10, maxCommentLength: 1000,
        phonePattern: /^(\+?56)?[\s-]?[1-9][\s-]?\d{4}[\s-]?\d{4}$/,
        emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    state: { isSubmitting: false, errors: {}, data: { nombre: '', telefono: '', email: '', servicio: '', comentario: '' } },
    validateField(field, value) {
        const errors = {};
        switch (field) {
            case 'nombre':
                if (!value || value.trim().length < this.config.minNameLength) errors[field] = `El nombre debe tener al menos ${this.config.minNameLength} caracteres`;
                else if (value.trim().length > this.config.maxNameLength) errors[field] = `El nombre no puede exceder ${this.config.maxNameLength} caracteres`;
                else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) errors[field] = 'El nombre solo puede contener letras y espacios';
                break;
            case 'telefono':
                if (!value || !this.config.phonePattern.test(value.replace(/\s/g, ''))) errors[field] = 'Ingrese un número de teléfono válido (ej: +56 9 1234 5678)';
                break;
            case 'email':
                if (!value || !this.config.emailPattern.test(value.trim())) errors[field] = 'Ingrese un email válido';
                break;
            case 'comentario':
                if (!value || value.trim().length < this.config.minCommentLength) errors[field] = `El comentario debe tener al menos ${this.config.minCommentLength} caracteres`;
                else if (value.trim().length > this.config.maxCommentLength) errors[field] = `El comentario no puede exceder ${this.config.maxCommentLength} caracteres`;
                break;
        }
        return errors;
    },
    validateForm(data) {
        let allErrors = {};
        Object.keys(data).forEach(field => {
            if (field === 'servicio') return;
            const fieldErrors = this.validateField(field, data[field]);
            allErrors = { ...allErrors, ...fieldErrors };
        });
        this.state.errors = allErrors;
        return Object.keys(allErrors).length === 0;
    },
    reset() {
        this.state.isSubmitting = false;
        this.state.errors = {};
    }
};
const FormView = {
    elements: { form: null, fields: {}, submitButton: null, errorContainer: null },
    init() {
        this.elements.form = document.getElementById('contactForm');
        if (this.elements.form) {
            this.elements.fields = {
                nombre: this.elements.form.querySelector('#nombre'),
                telefono: this.elements.form.querySelector('#telefono'),
                email: this.elements.form.querySelector('#email'),
                servicio: this.elements.form.querySelector('#servicio'),
                comentario: this.elements.form.querySelector('#comentario')
            };
            this.elements.submitButton = this.elements.form.querySelector('button[type="submit"]');
            this.createErrorContainer();
        }
    },
    createErrorContainer() {
        this.elements.errorContainer = document.createElement('div');
        this.elements.errorContainer.className = 'form-errors';
        this.elements.errorContainer.style.cssText = `background:#fee;border:1px solid #fcc;border-radius:8px;padding:15px;margin-bottom:20px;display:none;`;
        if (this.elements.form) this.elements.form.insertBefore(this.elements.errorContainer, this.elements.form.firstChild);
    },
    clearFieldError(field) {
        const fieldElement = this.elements.fields[field];
        if (!fieldElement) return;
        fieldElement.classList.remove('error');
        const errorElement = fieldElement.parentNode.querySelector('.field-error');
        if (errorElement) errorElement.remove();
    },
    showGeneralErrors(errors) {
        if (Object.keys(errors).length === 0) {
            this.elements.errorContainer.style.display = 'none';
            return;
        }
        const errorList = Object.entries(errors).map(([field, message]) => `<li><strong>${this.getFieldLabel(field)}:</strong> ${message}</li>`).join('');
        this.elements.errorContainer.innerHTML = `<h4 style="margin:0 0 10px 0;color:#c0392b;"><i class="fas fa-exclamation-triangle"></i> Por favor corrige los siguientes errores:</h4><ul style="margin:0;padding-left:20px;">${errorList}</ul>`;
        this.elements.errorContainer.style.display = 'block';
    },
    getFieldLabel(field) {
        const labels = { nombre: 'Nombre', telefono: 'Teléfono', email: 'Email', servicio: 'Servicio', comentario: 'Comentario' };
        return labels[field] || field;
    },
    setSubmitButtonLoading(loading) {
        if (!this.elements.submitButton) return;
        if (loading) {
            this.elements.submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando...`;
            this.elements.submitButton.disabled = true;
        } else {
            this.elements.submitButton.innerHTML = `<i class="fas fa-paper-plane"></i> Enviar Solicitud`;
            this.elements.submitButton.disabled = false;
        }
    },
    clearAllErrors() {
        Object.keys(this.elements.fields).forEach(field => this.clearFieldError(field));
        if (this.elements.errorContainer) this.elements.errorContainer.style.display = 'none';
    },
    clearForm() {
        if (this.elements.form) this.elements.form.reset();
        this.clearAllErrors();
    },
    getFormData() {
        const data = {};
        Object.entries(this.elements.fields).forEach(([field, element]) => { if (element) data[field] = element.value; });
        return data;
    }
};
const FormController = {
    init() {
        FormView.init();
        if (FormView.elements.form) {
            this.setupEventListeners();
            console.log('Form Handler (simplificado) inicializado.');
        }
    },
    setupEventListeners() {
        FormView.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    },
    async submitToBackend(data) {
        const functionUrl = 'https://handlecontactform-oud5hzev5q-uc.a.run.app';
        try {
            const response = await fetch(functionUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("El servidor no pudo procesar la solicitud.");
            return await response.json();
        } catch (error) {
            console.error("Error al llamar a la Cloud Function: ", error);
            throw new Error("No se pudo conectar con el servidor.");
        }
    },
    async handleSubmit() {
        if (FormModel.state.isSubmitting) return;
        const formData = FormView.getFormData();
        const isValid = FormModel.validateForm(formData);
        if (!isValid) {
            FormView.showGeneralErrors(FormModel.state.errors);
            return;
        }
        FormView.clearAllErrors();
        try {
            FormModel.state.isSubmitting = true;
            FormView.setSubmitButtonLoading(true);
            // CÓDIGO CORREGIDO QUE DEBES USAR
        const dataForBackend = {
             nombre: formData.nombre,
             email: formData.email,
             telefono: formData.telefono,
             servicio: formData.servicio,
             comentario: formData.comentario
            };
            await this.submitToBackend(dataForBackend);
            alert('¡Gracias! Tu solicitud ha sido enviada con éxito.');
            FormModel.reset();
            FormView.clearForm();
        } catch (error) {
            alert(error.message);
        } finally {
            FormModel.state.isSubmitting = false;
            FormView.setSubmitButtonLoading(false);
        }
    }
};
document.addEventListener('DOMContentLoaded', () => {
    FormController.init();
});