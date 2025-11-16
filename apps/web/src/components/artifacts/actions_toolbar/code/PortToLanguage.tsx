import { ProgrammingLanguageOptions } from "@opencanvas/shared/types";
import { useToast } from "@/hooks/use-toast";
import { ProgrammingLanguageList } from "@/components/ui/programming-lang-dropdown";
import { GraphInput } from "@opencanvas/shared/types";

export interface PortToLanguageOptionsProps {
  streamMessage: (params: GraphInput) => Promise<void>;
  handleClose: () => void;
  language: ProgrammingLanguageOptions;
}

const prettifyLanguage = (language: ProgrammingLanguageOptions) => {
  switch (language) {
    case "php":
      return "PHP";
    case "typescript":
      return "TypeScript";
    case "javascript":
      return "JavaScript";
    case "cpp":
      return "C++";
    case "java":
      return "Java";
    case "python":
      return "Python";
    case "html":
      return "HTML";
    case "sql":
      return "SQL";
    default:
      return language;
  }
};

export function PortToLanguageOptions(props: PortToLanguageOptionsProps) {
  const { streamMessage } = props;
  const { toast } = useToast();

  const handleSubmit = async (portLanguage: ProgrammingLanguageOptions) => {
    if (portLanguage === props.language) {
      toast({
        title: "언어 변환 오류",
        description: `코드가 이미 ${prettifyLanguage(portLanguage)}로 작성되어 있습니다`,
        duration: 5000,
      });
      props.handleClose();
      return;
    }

    props.handleClose();
    await streamMessage({
      portLanguage,
    });
  };

  return <ProgrammingLanguageList handleSubmit={handleSubmit} />;
}
