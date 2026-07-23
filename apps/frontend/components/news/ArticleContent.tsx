import styles from './ArticleContent.module.css';

type ArticleContentProps = { contentHtml: string };

export function ArticleContent({ contentHtml }: ArticleContentProps) {
  return <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />;
}
