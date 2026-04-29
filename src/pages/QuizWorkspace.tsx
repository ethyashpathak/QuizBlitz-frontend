import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Quiz, Question } from '../types';
import { QuestionCard } from '../components/QuestionCard';
import { Modal } from '../components/Modal';
import { Loader2, Plus, Edit3, Trash2, ArrowLeft, Users, Settings, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizWorkspace() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isEditQuizModalOpen, setEditQuizModalOpen] = useState(false);
  const [isQuestionModalOpen, setQuestionModalOpen] = useState(false);
  const [isCohostModalOpen, setCohostModalOpen] = useState(false);

  // Forms state
  const [quizFormData, setQuizFormData] = useState({ title: '', description: '', startTime: '', isPermanent: false });
  const [questionFormData, setQuestionFormData] = useState<Question>({ question: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctOption: 0, points: 10, timer: 30 });
  const [cohostEmail, setCohostEmail] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quiz/${quizId}/`);
      const quizData = res.data.quiz || res.data;
      setQuiz(quizData);
      setQuestions(quizData.questions || []);
      setQuizFormData({
        title: quizData.title,
        description: quizData.description || '',
        startTime: quizData.startTime ? new Date(quizData.startTime).toISOString().slice(0, 16) : '',
        isPermanent: quizData.isPermanent,
      });
    } catch (error) {
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // --- Quiz Handlers ---
  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...quizFormData,
        startTime: quizFormData.startTime ? new Date(quizFormData.startTime).toISOString() : new Date().toISOString(),
      };
      await api.patch(`/quiz/${quizId}/`, payload);
      toast.success('Quiz updated successfully');
      setEditQuizModalOpen(false);
      fetchQuiz();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quiz/${quizId}/`);
      toast.success('Quiz deleted');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  // --- Question Handlers ---
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestionId) {
        // Edit existing
        await api.patch(`/quiz/questions/${quizId}/`, { questionId: editingQuestionId, ...questionFormData });
        toast.success('Question updated');
      } else {
        // Add new (Bulk API supports array)
        await api.post(`/quiz/questions/${quizId}/`, { questions: [questionFormData] });
        toast.success('Question added');
      }
      setQuestionModalOpen(false);
      fetchQuiz();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteQuestions = async () => {
    if (selectedQuestionIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedQuestionIds.size} questions?`)) return;
    try {
      await api.delete(`/quiz/questions/${quizId}/`, { data: { questionIds: Array.from(selectedQuestionIds) } });
      toast.success('Questions deleted');
      setSelectedQuestionIds(new Set());
      fetchQuiz();
    } catch (error) {
      console.error(error);
    }
  };

  const openQuestionModal = (q?: Question) => {
    if (q) {
      setEditingQuestionId(q._id || q.id || null);
      setQuestionFormData(q);
    } else {
      setEditingQuestionId(null);
      setQuestionFormData({ question: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctOption: 0, points: 10, timer: 30 });
    }
    setQuestionModalOpen(true);
  };

  const toggleQuestionSelection = (id: string, isSelected: boolean) => {
    const newSet = new Set(selectedQuestionIds);
    if (isSelected) newSet.add(id);
    else newSet.delete(id);
    setSelectedQuestionIds(newSet);
  };

  // --- Cohost Handlers ---
  const handleAddCohost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/co-host/${quizId}/`, { coHostEmail: cohostEmail });
      toast.success('Invite sent to co-host');
      setCohostEmail('');
      setCohostModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex h-64 justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (!quiz) return null;

  return (
    <div>
      <div className="mb-4">
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-medium w-fit">
          <ArrowLeft size={20} /> Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white flex justify-between items-start">
          <div>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold border border-white/30 mb-3">
              Room Code: {quiz.roomCode}
            </div>
            <h1 className="text-3xl font-extrabold mb-2">{quiz.title}</h1>
            <p className="text-indigo-100 max-w-2xl">{quiz.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditQuizModalOpen(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors" title="Edit Quiz">
              <Edit3 size={20} />
            </button>
            <button onClick={() => setCohostModalOpen(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors" title="Manage Co-hosts">
              <Users size={20} />
            </button>
            <button onClick={handleDeleteQuiz} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-colors" title="Delete Quiz">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        <div className="bg-gray-50 p-4 flex gap-6 text-sm font-medium text-gray-600 border-t border-gray-100">
          <div>Questions: <span className="text-gray-900 font-bold">{questions.length}</span></div>
          <div>Total Points: <span className="text-gray-900 font-bold">{quiz.totalPoints || 0}</span></div>
          <div>Status: <span className={`px-2 py-0.5 rounded text-xs font-bold ${quiz.isPermanent ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{quiz.isPermanent ? 'Permanent' : 'Scheduled'}</span></div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Questions
        </h2>
        <div className="flex gap-3">
          {selectedQuestionIds.size > 0 && (
            <button onClick={handleDeleteQuestions} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 flex items-center gap-2 transition-colors">
              <Trash2 size={18} /> Delete Selected ({selectedQuestionIds.size})
            </button>
          )}
          <button onClick={() => openQuestionModal()} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm">
            <PlusCircle size={18} /> Add Question
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-lg font-bold text-gray-900 mb-1">No questions yet</h3>
            <p className="text-gray-500 mb-4">Start adding questions to your quiz!</p>
            <button onClick={() => openQuestionModal()} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
              Add First Question
            </button>
          </div>
        ) : (
          questions.map((q, i) => (
            <QuestionCard
              key={q._id || q.id}
              question={q}
              index={i}
              onEdit={openQuestionModal}
              onDelete={async (id) => {
                if (window.confirm('Delete this question?')) {
                  try {
                    await api.delete(`/quiz/questions/${quizId}/`, { data: { questionIds: [id] } });
                    toast.success('Question deleted');
                    fetchQuiz();
                  } catch (e) { console.error(e); }
                }
              }}
              isSelected={selectedQuestionIds.has(q._id as string || q.id as string)}
              onSelect={toggleQuestionSelection}
            />
          ))
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={isEditQuizModalOpen} onClose={() => setEditQuizModalOpen(false)} title="Edit Quiz Settings">
        <form onSubmit={handleUpdateQuiz} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input required type="text" value={quizFormData.title} onChange={e => setQuizFormData({ ...quizFormData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea value={quizFormData.description} onChange={e => setQuizFormData({ ...quizFormData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Save Changes</button>
        </form>
      </Modal>

      <Modal isOpen={isCohostModalOpen} onClose={() => setCohostModalOpen(false)} title="Add Co-host">
        <form onSubmit={handleAddCohost} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Co-host Email</label>
            <input required type="email" value={cohostEmail} onChange={e => setCohostEmail(e.target.value)} placeholder="colleague@example.com" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Send Invite</button>
        </form>
      </Modal>

      <Modal isOpen={isQuestionModalOpen} onClose={() => setQuestionModalOpen(false)} title={editingQuestionId ? 'Edit Question' : 'Add Question'} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveQuestion} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Question Text</label>
            <input required type="text" value={questionFormData.question} onChange={e => setQuestionFormData({ ...questionFormData, question: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-lg" placeholder="What is 2 + 2?" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questionFormData.options.map((opt, i) => (
              <div key={i} className={`p-3 border-2 rounded-xl flex items-center gap-3 transition-colors ${questionFormData.correctOption === i ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input type="radio" name="correctOption" checked={questionFormData.correctOption === i} onChange={() => setQuestionFormData({ ...questionFormData, correctOption: i })} className="w-5 h-5 text-green-600" />
                <input required type="text" value={opt.text} onChange={e => {
                  const newOpts = [...questionFormData.options];
                  newOpts[i].text = e.target.value;
                  setQuestionFormData({ ...questionFormData, options: newOpts });
                }} className="flex-1 bg-transparent border-none outline-none font-medium" placeholder={`Option ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Points</label>
              <input type="number" min="0" value={questionFormData.points} onChange={e => setQuestionFormData({ ...questionFormData, points: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Time Limit (s)</label>
              <select value={questionFormData.timer} onChange={e => setQuestionFormData({ ...questionFormData, timer: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg">
                {[10, 20, 30, 60, 90, 120].map(t => <option key={t} value={t}>{t} seconds</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
            {editingQuestionId ? 'Update Question' : 'Add Question'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
