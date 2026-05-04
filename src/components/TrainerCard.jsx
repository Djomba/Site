function TrainerCard({ trainer, onSelect }) {
  return (
    <article className="trainer-card">
      <div className={`trainer-portrait ${trainer.portraitClass}`}>
        <img src={trainer.photo} alt={`Тренер ${trainer.name}`} />
        <span className="portrait-ribbon" />
      </div>

      <div className="trainer-card-body">
        <span className="trainer-role">{trainer.role}</span>
        <h3>{trainer.name}</h3>
        <div className="trainer-meta">
          <span>Опыт: {trainer.experience}</span>
          <span>{trainer.specialization}</span>
        </div>
        <p>{trainer.shortDescription}</p>
      </div>

      <button className="primary-button full-width" onClick={() => onSelect(trainer.id)}>
        Выбрать тренера
      </button>
    </article>
  );
}

export default TrainerCard;
