import TrainerCard from '../components/TrainerCard.jsx';

function TrainersPage({ trainers, onNavigate }) {
  return (
    <section className="page-section trainers-page">
      <div className="page-heading">
        <span className="section-kicker">Команда SPACE</span>
        <h1>Выберите тренера</h1>
        <p>Познакомьтесь с нашими специалистами и выберите тренера, который подходит именно вам</p>
      </div>

      <div className="trainers-grid">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onSelect={(trainerId) => onNavigate('trainerDetails', trainerId)}
          />
        ))}
      </div>
    </section>
  );
}

export default TrainersPage;
