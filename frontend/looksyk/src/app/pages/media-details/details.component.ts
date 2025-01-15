import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BehaviorSubject, Subject} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {MediaPreview, MediaService} from "../../services/media.service";
import {MarkdownComponent} from "../components/markdown/markdown.component";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {HistoryService} from "../../services/history.service";

@Component({
  selector: 'app-media-details-overview',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit {

  private route: ActivatedRoute = inject(ActivatedRoute);
  private mediaService: MediaService = inject(MediaService);
  public sanitizer: DomSanitizer = inject(DomSanitizer);

  public pageName: Subject<string> = new BehaviorSubject("");
  public pageName$ = this.pageName.asObservable();

  private historyService = inject(HistoryService);


  public mediaInfo: Subject<MediaPreview> = new BehaviorSubject({
    properties: {
      size: "",
      fullQualifiedPath: ""
    }
  });
  public mediaInfo$ = this.mediaInfo.asObservable();

  bypass(trustedUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(trustedUrl.toString());
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => {
        const pageNameUnencoded = params["name"];
        const pageName = decodeURIComponent(pageNameUnencoded);
        this.pageName.next(pageName);
        this.mediaService.getMediaPreviewInfo(pageName).subscribe(
          mediaPreview => this.mediaInfo.next(mediaPreview)
        );
        this.historyService.pushEntry(pageName, ["/assets/", pageName]);
      });
  }

}
