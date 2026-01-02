
export type ToolType = 'pencil' | 'highlighter' | 'eraser';
export type View = 'HOME' | 'AFFAIRS' | 'NOTES' | 'TEST' | 'READER';

export interface Point { x: number; y: number; }

export interface AnnotationPath {
  id: string;
  tool: ToolType;
  color: string;
  width: number;
  points: Point[];
  pageIndex: number;
}

export interface Book {
  id: string;
  name: string;
  dataUrl: string;
  uploadDate: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyNote {
  title: string;
  content: string | string[];
}

export interface CurrentAffairs {
  text: string;
  language: string;
}
