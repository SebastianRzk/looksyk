use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};
use std::hash::{Hash, Hasher};

#[derive(Clone, Debug)]
pub struct RawBlock {
    pub indentation: usize,
    pub text_content: Vec<String>,
}

#[derive(Clone)]
pub struct ParsedBlock {
    pub indentation: usize,
    pub content: Vec<BlockContent>,
}

#[cfg(test)]
pub mod builder {
    use crate::looksyk::builder::text_token;
    use crate::looksyk::model::{BlockContent, BlockToken, ParsedBlock};

    pub fn block_with_text_content(content: &str) -> ParsedBlock {
        ParsedBlock {
            indentation: 0,
            content: vec![BlockContent {
                as_text: content.to_string(),
                as_tokens: vec![text_token(content)],
            }],
        }
    }

    pub fn query_block_token(query_payload: &str) -> BlockToken {
        BlockToken {
            block_token_type: super::BlockTokenType::QUERY,
            payload: query_payload.to_string(),
        }
    }
}

#[derive(Clone)]
pub struct PreparedBlock {
    pub indentation: usize,
    pub content: PreparedBlockContent,
    pub referenced_markdown: Vec<PreparedReferencedMarkdown>,
    pub has_dynamic_content: bool,
}

#[derive(Clone)]
pub struct PreparedBlockContent {
    pub original_text: String,
    pub prepared_markdown: String,
}

#[derive(Clone)]
pub struct BlockContent {
    pub as_text: String,
    pub as_tokens: Vec<BlockToken>,
}

#[derive(Clone, PartialEq, Debug, Hash, Eq)]
pub enum BlockTokenType {
    TEXT,
    LINK,
    JOURNALLINK,
    QUERY,
    TODO,
}

#[derive(Clone, Debug, PartialEq)]
pub struct BlockToken {
    pub block_token_type: BlockTokenType,
    pub payload: String,
}

#[derive(Clone)]
pub struct PreparedMarkdownFile {
    pub blocks: Vec<PreparedBlock>,
}

#[derive(Clone)]
pub struct RawMarkdownFile {
    pub blocks: Vec<RawBlock>,
}

#[derive(Clone)]
pub struct ParsedMarkdownFile {
    pub blocks: Vec<ParsedBlock>,
}

impl Display for RawMarkdownFile {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.blocks)
    }
}

pub struct UpdateBlock {
    pub markdown: String,
    pub reference: MarkdownReference,
}

pub struct UpdateMarkdownFile {
    pub blocks: Vec<RawBlock>,
}

pub struct QueryRenderResult {
    pub inplace_markdown: String,
    pub referenced_markdown: Vec<ReferencedMarkdown>,
    pub has_dynamic_content: bool,
}

#[derive(Clone)]
pub struct ReferencedMarkdown {
    pub content: ParsedBlock,
    pub reference: MarkdownReference,
}

#[derive(Clone)]
pub struct MarkdownReference {
    pub page_id: PageId,
    pub block_number: usize,
}

#[derive(Clone)]
pub struct PreparedReferencedMarkdown {
    pub content: PreparedBlockContent,
    pub reference: MarkdownReference,
}

#[derive(PartialEq, Eq, Debug, Clone)]
pub enum PageType {
    UserPage,
    JournalPage,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SimplePageName {
    pub name: String,
}

impl SimplePageName {
    pub fn as_journal_page(&self) -> PageId {
        PageId {
            page_type: PageType::JournalPage,
            name: self.clone(),
        }
    }

    pub fn as_user_page(&self) -> PageId {
        PageId {
            page_type: PageType::UserPage,
            name: self.clone(),
        }
    }

    pub fn as_page_id(&self, page_type: &PageType) -> PageId {
        PageId {
            page_type: page_type.clone(),
            name: self.clone(),
        }
    }
}

impl Hash for SimplePageName {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.name.hash(state)
    }
}

impl PartialEq for SimplePageName {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}

impl Eq for SimplePageName {}

impl Hash for PageId {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.name.hash(state)
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PageId {
    pub page_type: PageType,
    pub name: SimplePageName,
}

impl PageId {
    pub fn is_user_page(&self) -> bool {
        self.page_type == PageType::UserPage
    }
}

#[cfg(test)]
mod tests {
    use crate::looksyk::builder::page_name_str;
    use crate::looksyk::model::{PageId, PageType};

    #[test]
    fn test_journal_page_id_should_be_a_journal_page() {
        let page_id = PageId {
            page_type: PageType::JournalPage,
            name: page_name_str("my-page"),
        };
        assert!(!page_id.is_user_page());
    }
    #[test]
    fn test_user_page_id_should_be_a_user_page() {
        let page_id = PageId {
            page_type: PageType::UserPage,
            name: page_name_str("my-page"),
        };
        assert!(page_id.is_user_page());
    }

    #[test]
    fn test_as_journal_page_id_should_be_journal_page_id() {
        let page_id = page_name_str("my-page").as_journal_page();
        assert_eq!(page_id.page_type, PageType::JournalPage);
    }

    #[test]
    fn test_as_user_page_id_should_be_user_page_id() {
        let page_id = page_name_str("my-page").as_user_page();
        assert_eq!(page_id.page_type, PageType::UserPage);
    }
}
