import { GlowPanel } from '../components/hud';

export default function Projects() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-primary glow-text">
          Projects
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your coding projects
        </p>
      </header>

      <GlowPanel cornerAccents className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted mb-4">No projects yet</p>
          <button className="jarvis-button">Create Project</button>
        </div>
      </GlowPanel>
    </div>
  );
}
