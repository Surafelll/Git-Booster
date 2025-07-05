import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CommitJob } from './commit-job.entity';

@Entity('commit_logs')
export class CommitLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  commitJobId: string;

  @Column()
  repoName: string;

  @Column()
  commitMessage: string;

  @Column()
  commitHash: string;

  @Column()
  commitUrl: string;

  @Column({ default: true })
  isSuccess: boolean;

  @Column({ nullable: true })
  errorMessage: string;

  @Column('datetime')
  scheduledAt: Date;

  @Column('datetime', { nullable: true })
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.commitLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => CommitJob, (commitJob) => commitJob.commitLogs)
  @JoinColumn({ name: 'commitJobId' })
  commitJob: CommitJob;
}