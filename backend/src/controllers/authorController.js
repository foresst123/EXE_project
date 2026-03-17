import {
  createAuthor,
  deleteAuthor,
  getAuthorBySlug,
  getAuthors,
  updateAuthor,
} from "../services/authorService.js";

export const listAuthors = async (_req, res) => {
  const authors = await getAuthors();
  res.json(authors);
};

export const getAuthorHandler = async (req, res) => {
  const author = await getAuthorBySlug(req.params.slug);
  res.json(author);
};

export const createAuthorHandler = async (req, res) => {
  const author = await createAuthor(req.body);
  res.status(201).json(author);
};

export const updateAuthorHandler = async (req, res) => {
  const author = await updateAuthor(req.params.id, req.body);
  res.json(author);
};

export const deleteAuthorHandler = async (req, res) => {
  const result = await deleteAuthor(req.params.id);
  res.json(result);
};
