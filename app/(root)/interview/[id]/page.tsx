import DisplayTechIcons from "@/components/DisplayTechIcons";
import { getCurrentUser } from "@/lib/action/auth.action";
import { getInterviewById } from "@/lib/action/general.action";
import { getRandomInterviewCover } from "@/lib/utils";
import Image from "next/image";
import { redirect } from "next/navigation";
import AgentWrapper from "@/components/AgentWrapper";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);
  if (!interview) redirect("/home");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row flex-wrap gap-4 items-center justify-between p-4 rounded-2xl border border-white/10 bg-dark-200/50">
        <div className="flex flex-row gap-4 items-center flex-wrap">
          <div className="flex flex-row gap-3 items-center">
            <Image
              src={interview.coverImage || getRandomInterviewCover()}
              alt="cover"
              width={44}
              height={44}
              className="rounded-xl object-cover size-11 ring-2 ring-white/10"
            />
            <h3 className="capitalize text-lg font-semibold text-light-100">
              {interview.role} Interview
            </h3>
          </div>
          <DisplayTechIcons techStack={interview.techstack} />
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-primary-300/20 text-primary-100 text-sm font-medium capitalize border border-primary-200/30">
          {interview.type}
        </span>
      </div>
            <AgentWrapper
              userName={user?.name}
              userId={user?.id}
              interviewId={id}
              type="interview"
              questions={interview?.questions}
            />
    </div>
  );
};

export default Page;
