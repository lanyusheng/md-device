import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col p-4'>
      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <p className='text-sm font-medium'>用户名</p>
              <p className='text-sm text-muted-foreground'>admin</p>
            </div>
            <div>
              <p className='text-sm font-medium'>邮箱</p>
              <p className='text-sm text-muted-foreground'>admin@example.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
