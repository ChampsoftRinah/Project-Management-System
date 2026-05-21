import { useState } from 'react';
import apiClient from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errors';
import Button from './ui/Button';
import { Input, Textarea } from './ui/Input';
import Modal from './ui/Modal';

interface ProjectFormProps {
  onSuccess: () => void;
}

export default function ProjectForm({ onSuccess }: ProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/projects', { name, description });
      setIsOpen(false);
      setName('');
      setDescription('');
      onSuccess();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        id="open-new-project-button"
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full"
      >
        New Project
      </Button>

      <Modal title="Create a new project" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="projectName"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Project name
            </label>
            <Input
              id="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a memorable project name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="projectDescription"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>
            <Textarea
              id="projectDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a brief summary of the project goals"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Creating project...' : 'Create project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
