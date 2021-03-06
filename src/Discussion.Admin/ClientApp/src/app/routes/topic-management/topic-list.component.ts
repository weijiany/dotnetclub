import {Component, OnInit} from '@angular/core';
import {_HttpClient, SettingsService} from '@delon/theme';
import {TopicSummary} from './topic';
import {ApiResponse} from "../../api-response";
import {STChange, STColumn, STPage} from "@delon/abc";
import {NzMessageService} from "ng-zorro-antd";
import {Router} from "@angular/router";
import {Paged, Paging} from "@core/pagination";


@Component({
  selector: 'app-topic-list',
  templateUrl: './topic-list.component.html',
})


export class TopicListComponent implements OnInit {
  dotnetClubHostName: string;

  topics: TopicSummary[] = [];
  paging: Paging = new Paging();
  loading: boolean = false;
  error: any = null;

  stPagingOptions: STPage = {
    front: false
  };
  columns: STColumn[] = [
    { title: '编号', index: 'id', width: '10%',
      format: (topic: TopicSummary) => {
        return `<a href="https://${this.dotnetClubHostName}/topics/${topic.id}" target="_blank">${topic.id}</a>`;
      }
    },
    { title: '标题', index: 'title', width: '60%' },
    {
      title: '作者',
      index: 'author.displayName',
      width: '15%'
    },
    {
      title: '操作',
      width: '15%',
      buttons: [
        {
          text: '删除',
          click: (topic: TopicSummary) => {
            if(!window.confirm('确定要删除话题吗？\n' + topic.title)){
              return;
            }

            this.delete(topic.id, topic.title);
          }
        }
      ],
    },
  ];

  constructor(private httpClient: _HttpClient, private msg: NzMessageService,
              private router: Router, private settingsService : SettingsService) {
    this.dotnetClubHostName = settingsService.app.clubHostName;
  }

  dispatchClick( event: STChange ){
    if(event.pi !== this.paging.currentPage){
      this.getTopics(event.pi);
    }

    if( event.click ){
      const index = event.click.index;
      const clickedTopic = this.topics[index];
      this.router.navigate(['/topics', clickedTopic.id]);
    }
  }


  getTopics(page : number){
    this.error = null;
    this.loading = true;

    this.httpClient.get<ApiResponse>('api/topics?page=' + page)
      .subscribe(data => {
        this.loading = false;

        if(data.code === 200){
          const topicResult = <Paged<TopicSummary>>data.result;

          this.topics = topicResult.items;
          this.paging = topicResult.paging;
        }else{
          this.msg.error(data.errorMessage);
        }
      }, (err: any) => {
        this.loading = false;
        this.msg.error(err);
      });
  }

  delete(topicId: number, topicTitle: string){
    this.httpClient.delete('api/topics/' + topicId)
      .subscribe((data: ApiResponse) => {
        if(data.code === 200){
          this.msg.success(`已删除 ${topicTitle}`);
          this.getTopics(1);
        }else{
          this.msg.error(data.errorMessage);
        }
      }, (err: any) => {
        this.msg.error(err);
      });
  }

  ngOnInit() {
    this.getTopics(1);
  }

}
