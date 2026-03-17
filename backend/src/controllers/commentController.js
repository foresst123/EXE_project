import {
  createComment,
  getCommentPermission,
  getCommentsByProductId,
} from "../services/commentService.js";

export const listCommentsHandler = async (req, res) => {
  const comments = await getCommentsByProductId(req.params.id);
  res.json(comments);
};

export const createCommentHandler = async (req, res) => {
  const comment = await createComment(req.params.id, req.user, req.body);
  res.status(201).json(comment);
};

export const getCommentPermissionHandler = async (req, res) => {
  const permission = await getCommentPermission(req.params.id, req.user.id);
  res.json(permission);
};
