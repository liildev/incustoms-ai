import { cn } from '@/shared/lib/cn'
import { OPEN_QUESTIONS, PHASES, ROADMAP_TITLE } from '../model/roadmap'
import { RichText } from './rich-text'
import { SlideLayout } from './slide-layout'
import { TYPE } from './slide-type'

/** Closes the main story on an order of work and the questions only the team can answer. */
export const RoadmapSlide = () => (
  <SlideLayout
    title={ROADMAP_TITLE}
    notice={{ tone: 'recommendation', text: 'Что я бы сделал первым' }}
    className="flex flex-col justify-between gap-10"
  >
    <ol className="grid gap-8 stage:grid-cols-3 stage:gap-x-[72px]">
      {PHASES.map((phase, position) => (
        <li
          key={phase.title}
          className={cn(
            'flex flex-col gap-3 border-t-2 pt-4 stage:gap-5 stage:border-t-[3px] stage:pt-6',
            position === 0 ? 'border-primary' : 'border-input',
          )}
        >
          <h3 className={TYPE.title}>
            <span className="mr-3 text-primary tabular-nums stage:mr-4">{position + 1}</span>
            {phase.title}
          </h3>
          <ul className="flex flex-col gap-2 stage:gap-4">
            {phase.actions.map((action) => (
              <li key={action} className={TYPE.body}>
                <RichText text={action} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
    <section
      aria-labelledby="open-questions"
      className="flex flex-col gap-3 border-t border-border pt-5 stage:gap-5 stage:pt-8"
    >
      <h3 id="open-questions" className={TYPE.note}>
        Вопросы к команде
      </h3>
      <ul className="flex flex-col gap-3 stage:gap-4">
        {OPEN_QUESTIONS.map((question, position) => (
          <li
            key={question.source}
            className={cn(
              'text-lg leading-snug font-medium text-foreground stage:text-[32px] stage:leading-[1.3]',
              position > 0 && 'text-muted-foreground stage:text-[28px]',
            )}
          >
            <RichText text={question.text} />
          </li>
        ))}
      </ul>
    </section>
  </SlideLayout>
)
