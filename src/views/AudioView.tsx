import AudioBay from '@/components/AudioBay';

interface AudioViewProps {
  onVoiceError?: (msg: string) => void;
}

export default function AudioView({ onVoiceError }: AudioViewProps) {
  return (
    <div className="animate-fade-in">
      <AudioBay onVoiceError={onVoiceError} />
    </div>
  );
}
