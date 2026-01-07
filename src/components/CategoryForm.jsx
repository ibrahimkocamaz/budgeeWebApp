import React, { useState } from 'react';
import { availableColors, categoryIcons } from '../data/categoryOptions';
import { X, Check } from 'lucide-react';

const CategoryForm = ({ initialData, onSave, onCancel, type }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [selectedIcon, setSelectedIcon] = useState(initialData?.iconKey || 'food');
    const [selectedColor, setSelectedColor] = useState(initialData?.color || availableColors[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: initialData?.id || Date.now(),
            name,
            iconKey: selectedIcon,
            color: selectedColor,
            type
        });
    };

    const SelectedIconComponent = categoryIcons[selectedIcon]?.icon;

    return (
        <div className="category-form-overlay">
            <div className="category-form-modal">
                <div className="modal-header">
                    <h3>{initialData ? 'Edit Category' : 'New Category'}</h3>
                    <button onClick={onCancel} className="close-btn"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="form-content">
                    {/* Name Input */}
                    <div className="form-group">
                        <label>Category Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Groceries"
                            className="text-input"
                            autoFocus
                        />
                    </div>

                    {/* Icon Picker */}
                    <div className="form-group">
                        <label>Icon</label>
                        <div className="icon-grid">
                            {Object.entries(categoryIcons).map(([key, { icon: Icon }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`icon-btn ${selectedIcon === key ? 'selected' : ''}`}
                                    onClick={() => setSelectedIcon(key)}
                                    style={selectedIcon === key ? { backgroundColor: selectedColor, borderColor: selectedColor } : {}}
                                >
                                    <Icon size={20} color={selectedIcon === key ? 'white' : 'var(--text-muted)'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-grid">
                            {availableColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                                    onClick={() => setSelectedColor(color)}
                                    style={{ backgroundColor: color }}
                                >
                                    {selectedColor === color && <Check size={14} color="white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview & Actions */}
                    <div className="form-footer">
                        <div className="preview">
                            <span className="preview-label">Preview:</span>
                            <div className="preview-pill" style={{ backgroundColor: selectedColor + '20', color: selectedColor }}>
                                {SelectedIconComponent && <SelectedIconComponent size={16} />}
                                <span>{name || 'New Category'}</span>
                            </div>
                        </div>
                        <button type="submit" className="btn-save" style={{ backgroundColor: selectedColor }}>
                            Save Category
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        .category-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .category-form-modal {
          background-color: var(--bg-card);
          width: 90%;
          max-width: 500px;
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-divider);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }

        .form-content {
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group label {
          display: block;
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .text-input {
          width: 100%;
          background-color: var(--bg-app);
          border: 1px solid var(--color-divider);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: var(--text-main);
          font-size: 1rem;
        }
        
        .text-input:focus {
           outline: none;
           border-color: var(--color-brand);
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
          gap: 0.5rem;
          max-height: 150px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--color-divider);
          background-color: var(--bg-app);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background-color: rgba(255,255,255,0.05);
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
          gap: 0.75rem;
          max-height: 100px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .color-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .color-btn:hover {
          transform: scale(1.1);
        }

        .color-btn.selected {
           transform: scale(1.1);
           box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px white;
        }
        
        .form-footer {
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .preview-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .preview-label {
           color: var(--text-muted);
           font-size: 0.875rem;
           margin-right: 0.5rem;
        }

        .btn-save {
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
          max-width: 200px;
        }
        
        /* Scrollbar styles for grids */
        .icon-grid::-webkit-scrollbar, .color-grid::-webkit-scrollbar {
          width: 6px;
        }
        .icon-grid::-webkit-scrollbar-thumb, .color-grid::-webkit-scrollbar-thumb {
          background-color: var(--color-divider);
          border-radius: 3px;
        }
      `}</style>
        </div>
    );
};

export default CategoryForm;
