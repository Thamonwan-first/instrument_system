import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function EquipmentComments({ equipmentId, userId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newComment, setNewComment] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [userComment, setUserComment] = useState(null);

  useEffect(() => {
    loadComments();
  }, [equipmentId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoints.getEquipmentComments()}?equipment_id=${equipmentId}`);
      const data = await res.json();
      setComments(data.comments || []);
      
      // Check if user already commented
      const uc = data.comments.find(c => c.user_id === userId);
      setUserComment(uc);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('equipment_id', equipmentId);
      formData.append('rating', newComment.rating);
      formData.append('comment', newComment.comment);

      const res = await fetch(apiEndpoints.addEquipmentComment(), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert('ส่งความเห็นสำเร็จ');
        setNewComment({ rating: 5, comment: '' });
        setShowForm(false);
        loadComments();
        onCommentAdded?.();
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">กำลังโหลด...</div>;
  }

  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      {comments.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-2xl font-bold text-blue-600">⭐ {avgRating}</span>
          <div>
            <p className="font-bold text-gray-900">{comments.length} ความเห็น</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(avgRating) ? '⭐' : '☆'} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Button */}
      {!userComment && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 text-sm"
        >
          {showForm ? '✕ ยกเลิก' : '+ เพิ่มความเห็น'}
        </button>
      )}

      {/* Comment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">คะแนน</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewComment({ ...newComment, rating })}
                  className={`text-3xl transition-all ${
                    rating <= newComment.rating ? '⭐' : '☆'
                  }`}
                >
                  {' '}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ความเห็น</label>
            <textarea
              value={newComment.comment}
              onChange={e => setNewComment({ ...newComment, comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="แบ่งความสะดวก การใช้งาน และประสบการณ์ของคุณ"
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 text-sm"
          >
            ✓ ส่งความเห็น
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">ยังไม่มีความเห็น</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">{comment.first_name} {comment.last_name}</p>
                  <p className="text-xs text-gray-500">{comment.student_id}</p>
                </div>
                <div className="text-lg">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < comment.rating ? '⭐' : '☆'}</span>
                  ))}
                </div>
              </div>
              {comment.comment && (
                <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleString('th-TH')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EquipmentComments;
