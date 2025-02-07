module Explore
  class PostsController < ApplicationController
    respond_to :html, :json
    before_action :set_date, only: [:searches]

    def popular
      @post_set = PostSets::Popular.new(params[:date], params[:scale])
      @posts = @post_set.posts
      respond_with(@posts)
    end

    def searches
      @search_service = PopularSearchService.new(@date)
    end

    def missed_searches
      @search_service = MissedSearchService.new
    end

    def intro
      @presenter = IntroPresenter.new
      render :layout => "blank"
    end

    private

    def set_date
      @date = params[:date] ? Date.parse(params[:date]) : Date.today
    end

    def allowed_readonly_actions
      super + ["popular"]
    end
  end
end
