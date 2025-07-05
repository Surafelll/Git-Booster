import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CommitJob } from '../../commit/entities/commit-job.entity';
import { CommitLog } from '../../commit/entities/commit-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  githubId: string;

  @Column({ nullable: true })
  githubUsername: string;

  @Column({ nullable: true })
  githubAccessToken: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CommitJob, (commitJob) => commitJob.user)
  commitJobs: CommitJob[];

  @OneToMany(() => CommitLog, (commitLog) => commitLog.user)
  commitLogs: CommitLog[];
}