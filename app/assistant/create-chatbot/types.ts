export interface AssistantFormData {
  name: string;
  description: string;
  instructions: string;
  model: string;
}

export interface ExampleInstruction {
  title: string;
  instructions: string;
}

export interface ModelOption {
  value: string;
  label: string;
}
